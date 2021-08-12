import * as LZString from "lz-string";

import { binary, fPuzzles, bytesToUrlBase64, urlBase64ToBytes } from "../dist/board-format";
import { writeFile } from "fs/promises";

import fpuzzlesBoards from "@sudoku-studio/boards/fpuzzles";
import { schema } from "@sudoku-studio/schema";
import { StateManager, Update } from '@sudoku-studio/state-manager';

test('writeBoards', async () => {
    const x: (number | string)[][] = [];
    for (const [ name, fPuzzlesB64, soln ] of fpuzzlesBoards) {
        const boardFromFPuzzles = fPuzzles.parseFpuzzles(fPuzzlesB64);

        const boardState = new StateManager();
        boardState.update(boardFromFPuzzles as any);
        const board = boardState.get<schema.Board>();

        const ourBin = await binary.writeBuffer(board);
        const ourBinLzma = await binary.writeLzmaBuffer(board);
        const lzs = LZString.compressToUint8Array(JSON.stringify(board));

        const fileName = name.toLowerCase().replace(/[^0-9a-z]/g, '_');
        await writeFile(`${__dirname}/../../../boards/binary/${fileName}.bin`, ourBin, 'binary');
        await writeFile(`${__dirname}/../../../boards/binary/${fileName}.bin.lzma`, ourBinLzma, 'binary');
        await writeFile(`${__dirname}/../../../boards/binary/${fileName}.solution.txt`, soln, 'utf-8');

        x.push([ name, 0.75 * fPuzzlesB64.length, lzs.length, ourBinLzma.length, (ourBinLzma.length / lzs.length).toFixed(4) ]);
    }

    const otherBoards: Record<string, schema.Board> = {
        'Secret Pillars': {"grid":{"width":9,"height":9},"meta":{"title":"Secret Pillars","author":"echoes","description":"Normal killer sudoku rules apply; cages sum to the marked total without repeating digits.\n\nNormal parity rules apply; some even cells are marked with a gray square.\n\nNormal kropki rules apply; one edge is marked with a white dot, and the cells to either side have a difference of 1. Not all white dots are given."},"elements":{"1":{"type":"grid","order":101},"2":{"type":"box","order":100,"value":{"width":3,"height":3}},"10":{"type":"givens","order":220},"11":{"type":"filled","order":210},"12":{"type":"corner","order":200},"13":{"type":"center","order":200},"14":{"type":"colors","order":10},"355143166":{"type":"even","order":40,"value":{"0":true,"2":true,"4":true,"6":true,"30":true,"64":true}},"1288278304":{"type":"killer","order":120,"value":{"324446933":{"cells":{"76":true,"77":true},"sum":13},"383356378":{"cells":{"0":true,"1":true,"10":true,"19":true,"28":true,"37":true,"46":true,"55":true,"64":true},"sum":45},"422607914":{"cells":{"29":true,"38":true},"sum":13},"473944436":{"cells":{"58":true,"67":true},"sum":13},"879946307":{"cells":{"9":true,"18":true},"sum":10},"971141005":{"cells":{"13":true,"22":true},"sum":6},"1051867357":{"cells":{"44":true,"53":true},"sum":7},"1306705152":{"cells":{"26":true,"35":true},"sum":12},"1634447309":{"cells":{"54":true,"63":true},"sum":7},"2397216212":{"cells":{"60":true,"69":true},"sum":7},"2610385281":{"cells":{"24":true,"33":true},"sum":13},"2746150700":{"cells":{"8":true,"17":true},"sum":8},"2779053395":{"cells":{"56":true,"65":true},"sum":9},"3018678183":{"cells":{"74":true,"75":true},"sum":7},"3039715062":{"cells":{"78":true,"79":true},"sum":9},"3078906367":{"cells":{"31":true,"40":true},"sum":11},"3200753384":{"cells":{"11":true,"20":true},"sum":10},"3269771711":{"cells":{"36":true,"45":true},"sum":13},"3493960443":{"cells":{"2":true,"3":true,"12":true,"21":true,"30":true,"39":true,"48":true,"57":true,"66":true},"sum":45},"3533066374":{"cells":{"72":true,"73":true},"sum":13},"3536970188":{"cells":{"4":true,"5":true,"14":true,"23":true,"32":true,"41":true,"50":true,"59":true,"68":true},"sum":45},"3712599461":{"cells":{"6":true,"7":true,"16":true,"25":true,"34":true,"43":true,"52":true,"61":true,"70":true},"sum":45},"3972207821":{"cells":{"42":true,"51":true},"sum":10}}},"4100189067":{"type":"difference","order":140,"value":{"66":true}}}},
        'Test Cages': {"grid":{"width":9,"height":9},"elements":{"1":{"type":"grid","order":101},"2":{"type":"box","order":100,"value":{"width":3,"height":3}},"10":{"type":"givens","order":220},"11":{"type":"filled","order":210},"12":{"type":"corner","order":200},"13":{"type":"center","order":200},"14":{"type":"colors","order":10},"2752770097":{"type":"killer","order":120,"value":{"260959260":{"cells":{"40":true,"41":true,"42":true,"49":true,"50":true,"51":true,"58":true,"59":true,"60":true},"sum":45},"709425941":{"cells":{"72":true,"73":true,"74":true},"sum":13},"1686432428":{"cells":{"31":true,"32":true,"33":true,"34":true},"sum":20},"1840020358":{"cells":{"43":true,"52":true,"61":true,"70":true},"sum":20},"2757998033":{"cells":{"66":true,"67":true,"68":true,"69":true},"sum":20},"3303342985":{"cells":{"8":true,"17":true,"26":true},"sum":13},"3379948781":{"cells":{"30":true,"39":true,"48":true,"57":true},"sum":20}}}}},
    };
    for (const [ name, board ] of Object.entries(otherBoards)) {
        const ourBin = await binary.writeBuffer(board);
        const ourBinLzma = await binary.writeLzmaBuffer(board);
        const lzs = LZString.compressToUint8Array(JSON.stringify(board));

        const fileName = name.toLowerCase().replace(/[^0-9a-z]/g, '_');
        await writeFile(`${__dirname}/../../../boards/binary/${fileName}.bin`, ourBin, 'binary');
        await writeFile(`${__dirname}/../../../boards/binary/${fileName}.bin.lzma`, ourBinLzma, 'binary');

        x.push([ name, 0, lzs.length, ourBinLzma.length, (ourBinLzma.length / lzs.length).toFixed(4) ]);

        const ourB64 = bytesToUrlBase64(ourBinLzma);
        console.log(name, ourB64);
    }
    console.log(x.map(row => row.map((n, i) => `${n}`.padStart(i ? 10 : 30)).join(' ')).join('\n'));
});

describe('binary', () => {
    test('clipped', async () => {
        // // "Clipped" by glum_hippo: Arrow, Thermo, Givens, King
        // const fPuzzlesB64 = 'N4IgzglgXgpiBcBOANCALhNAbO8QGEsIAHYmAExFQEMBXNACwHsAnBEABQYiNIAIAQlloBbGH2oBranwDmwkQH1upJlRAtaOMDDTsAyrXJNJtPgFo+MAG4wWATz4smAd2R8AxkwUA7d9R9yPgBmAA9gvgAjJlC+EVowNE8mHzRqCB8JLCw+RnFyCFlMMD4AM2cRPgBGc0QAOj59JjE+AqK0EuoWcWosbupyRyLbHzqAHR8JgEFUiHMAaQzZCysAR1pe1sLiuOpHHyYktCZaDwYt6lkU3qx7ccmfABUGOxFm3TsVtp34xL5ElgQDzYRwZDz9HRlCpRLSRXJMXIke7TFjOFwrPKeCAsDw4ILfJJeHyJTD0GAlTFgUR8JilXIvLbtTpYFLLTFdNH3dSyQGUeAAbX5wAAvsgRWLReKpZKZRKALrIIWy6US1UqkUKpVq5Ugay9Wi4ABsqGGMB8CDQmhgyptmvVNu12rtOr1wlwAFYTRARharS79bgql6ffBLQb/W6EAAWYNm33hp2K+2O5MapMOqW6gMIYKx82hv0pmXOoul6Ul1MZ4sKkABDCSJbxmCoPIsN5iNB2BBCkBEHzk7v8kAAJUN+Hd6mHAHZ8FHJwAOfDBBf4ABMIDlcslvYyA4FQ+H7rXk6jS8nwVnk9Xl83277e8FI9PE9Qw4vhqv+Cnn/nG63Yp3fswEHEcj1/V8x2/V8Zw/V9Fw/W8aw5Vxu1Ae9gP3UDL1fU9l1fC911fa9103VAPBgbIMIPI853/NDdyo6j8FgkdIMnGdwJHRdf1IkByMo7ssIQu8GJA4dFxfEcZznCCz1kkia34rAqK48cNxEoCxOvSS32Yk8v30njFIo5TBOHbT1IA9CxJnPDVJkkdEDU3ilJU6czy3LcgA=';

        // // Unique classic 1
        // const fPuzzlesB64 = 'N4IgzglgXgpiBcBOANCALhNAbO8QCUIAHInMEVAQwFc0ALAewCcEQAFOiLYgAgDkYAdwC2lAHYUQTamRhpWfZqKw8w1ACYMA1tR7SyPSiSwBPAHQ8AgmPU96lNAHIwPTAEJJAcyYR1CANr+oABulFjUuCggnhDBMBLwaNIwAL7IwGkZ6ZmZIKHhuAAcqDFxCUkRufkRCADsJbHxCBWp6XlhNfAAbA1lzck5ALrIQTnZbdW4AIy9TYkDEx2Rs+ULWetDIxuLBQgATCv9lePbpynDozudAMyH88dnJ2MZF+vtu0h3Lc8/J++dM2ijVWD3+uB6QL691SrzBCGKkLm3yeKLekwQAFYvms4Z9ESDWi8trj6vijoTfmilggIaUkTj0fAEXSCVVqfAsWToZsgrjOSzyZS2R9mcDBVdllzkSF2bSxdyJXVsQ9zlshYqOcqKajcQAWLXnQYpIA===';


        // // "Bird in a Storm" by Gustaf Hafvenstein: Palindrome, Kropki w/negative constraint, King, Nonconsecutive
        // const fPuzzlesB64 = 'N4IgzglgXgpiBcBOANCALhNAbO8QCEIAnAEwAIIA7MgQzLDQHsiBbEVGgVzQAtmEQAcU4MaAMzIAJcQDcYlBjCrsQRTjjAw0AgMpoalEjVL1OJRgGtOZNRtoAHe1gCeAOjIAdSl70GjJiyJGewsIG3UYMAcnNzIAQTIAIywaAGMLMnM0ej4Adyi6IhoMRjJGCQBGeAAmJK1cmHkyNFzS1JgsLDB3BNyeTBhMxmzE+sbqFraOrrIWGAMo3hhnWiJB1MYFGFTuCDkezqG0ArWyAHM9+VcvLzjKDABaC0oIM55s20jol3cAOVKSK9MGRUgZ6I0KMcOhIqLQQTxIlFnq93oBMAiiLEY+xulAAKgjMkVctQsFRBhACmR7DRSYYgnNkLRDLMRB95uQlvQaHMyLkaCsxPSksMeGR5CRuiozkQICQEABteXAAC+yBVatV6q1mp1GoAusglbrtRrTSaVQajWbjTbrZbzbaHfrDU7XTb7Y7PXaXV63c6rX63R7rSGgwaQAYMMi3tp4Gg1DBUJRNhstjsMHIEPHOImQNTaSR6bglSBaZEFfKQAAlRAAYQAbCoa7WAKxNgActYALE2AOzdvutpv1htNlu13vDidj0eoKtd6dzheNucAZkX1fXK+r1Vnm6Hc93bcPA7XtdXTfXPaX55nF7nI/v1f7T6r/eqU4qID1euV4cBYhiDAayUO0CqgO0nRgAq1YVBuVZwY2v5qiAkFdDBVa7l+J4fshEHTNB8CVphtaIE2u7tt+mqoQRGHrq+V5UShaGEcR67YfuuHUSxGELq+C5ccxtFEdWfFNguPZ4TRUEYeOk5zuOlFSTxIlVuO25qdOynCcR47XtW45ttpMmqeOHGaYJ+EmcRI7mSOlnSehqkjvJ1Yjkh3E6c+8H9kpnnWd55nvkxVlOcRdaUXOdaTsZYXeR+D61g5KnEZ2r51hesWsfu/G3llGFwa+u6Zf5cVVoxJ6SaV2Xzqe+5VUJAWafptUNaFNWdi1dZtY5HUHtWdZGdVsn9VWI5DY1ZVwceO5Dvlzl7ppHmTTV/Yae5IW9RhdYaZ2y3tSNrljVpw2qRRTZwX5K0Yb5U5XQdql1mRc6dmR802aRg5vadxFwc9s3fddqmFRdA6/uGlAwGcxSXDBRQlN+qDwxAjAKr+QA===';

        // // "159" by zetamath (Renban, Kropki no negative constraint)
        // const fPuzzlesB64 = 'N4IgzglgXgpiBcBOANCALhNAbO8QEYBWREVAQwFc0ALAewCcERY0yBbMm0keinMGGiYA5BhywACXvwkAzBhLAUAJrQDWFZFJgA7AEZkdWw8olr6tAA5qIEspctYAngDpuAc3oRlCANq/QdwgAN10ABV0AYwgsAFkyejUwBB0+LABfZECQ8KiY+MTk+FSsDKyQINCdCJ1ouISklLTM7KqauoLG4ubyytza/IaikrLW/o6hptKWipzqvPrCqdHZtoXO4Z6x+YHFrpH0gF1kANXxwaXu6d659ov9rbOdicuDm7XdjeWZvuf7zeu2zuewBK1+wK+VzBt3WkyhPxhnzhB2Op3BsNej3RSMxgKeEORWMRLweeOxJNBCI+FO+73OINpQIxpOh1P+31RTJxLKp9Mhby5NPhdL+DOFgvZ4vxzMpIoJuNZfMJZOJkpRJwlYoF0u5ss1/KJbK1hqVCt5ooNKqNlsVFuVtvlPM5OqF2vJapNdrNcpljJdHqtpp5Pt1fvdxsDXqdGv9EYdvql4Zt5sdetjyZDrs9qbDqrjKYT6rReYz+vtBdDiZL5czAfjlbd1e9Zeb6fLzqTNZbwe7ac7rf7PbbA6bQ8HfdHlMOxx4ugMOj8oCwEB0MCK/hAACV8ABhABM3G3O4AzIfdwAWM87wggaczZer9e+Le7gBsV4A7FeABxXkh38oHzXPxn03Pcd1/VAwJ3EgoOPGDD3PBCAKXFdgPgDdN3gr84IgxC8Kgwg8JQkAgKfLdXx3HCKJ3d8oI/WjD2/RiSLIkCt0QRioM46jN04yCOOQw57zQ8i+P3Q9ONPVjRPYzdmIPKDmOk4TANkjDQM4/AmJ3bT6N0w9KO0mTHzkhjFJoizN0o09CJPW9VNQ0yNK3Ii9NciSoKQqz4IPEz0Mw3d3Og4L4OCpDjMc0j1Mw8CrPA2yt3gxLNyQlSROc2Kd0vKDwJvXKuK3cCv38sT4LorckIqzciPfUq5Pg/LKuvQ8iKa6yWrvGdlAgWRZBgegolwU5IhgUp1w82CPN/YSZ3oTgIFoRcQFG8a/C3BjgvM28ZlWrAJvkqjJKO2bUCA5a2Jco9gvA0KDK8gzp1QWgqCAncmAAYgAIQABl+37uAAd28Lh4B+lw90IDKAtAozD02nTgq0hzntetD3rwb6/uxoGQeoBBwch6GxLc1rPOanyJKekAXuwdHPv+nHUGB5RQcJqG1My0Ddys3cUovK8b2p2m3oZ7GAeZvGCYhjmnJhl9CqPXjdwEo9/xnEX6cxxmJZAFm2Zl4m5Liw8EsPZL8JU1G6dXDGQCxxncdZ/GwcNzn5Zq+yoJswzyc3bbhbR22xcdyXnelon3bEhSdKtmmg5gO2HaZvWpddyO5bEzirKklH45txOQ5T/WXfZo2rvAnKipagrquKvPNeD7XxZ+p2DYz6Kuer1XwKmrCEIe9XrdF5vQ9T8P09lzuPew82COa1WiJmjWE6TnXW7D9up8uzDGvw9q2t9oWV4LteW7b0u3czhrFaqsm6pPkf7fXi+I+3mLYaO73FYY6rmIf4eWtn7n03pfDuO9NKKx4sdVWnEh75yfsnXWJc37l0Cn7PmV4q5HmPoApu9sACi+Afo/QAGKkNfq7c8qBZAWDYJuQw7gwBqAAMq0CwKERg8A0C8BgGg7mitdzK3nmrBuq9PpEJIeQyh4NqEgFobQehjDmFsI4QNBAPCKB8KjsbERvc559yQvAxuhdMaSLIRQ0B0s5EKKUToJhrD2GcI0bw/hSUv7uNVkhRexFH5AI+uY6RViqE0LoQw+xKinHqO4a4nRV1KK8UotVX+OkAEIP8YEyx48DY2LCcoxxaiuGaO0dfK6nFqrQO4iIuBYjT4SOIRYmRLhcmKPCQ41RziYlaLceJHO9lA51LMQ0oJ2TL4tLse0qJRTYmlMwjHJS/S/H4ICcMrJKCQnyLyREgpnTik9ORgsra90aKRTwaYwhqymnjLaZEwpLjulxMwttb+VkfZ2TjiYpOmSrmhNafkjp0S9mPNAqTOyVlvJzz8ks85KypFrLTrI35Ezbm7JmdPMSQVTbHP7uFR60KvmXOCYizZfztkAumQ82ZoETYFRShbB6HzxFDLhT8klyKdmArRRA6u2C8pYrridfF9SWVEuaUim5HKKUlPRTfaqd87JpM+cKxporrn/Kmfc6V3L+7tSQgfGuNFcHpOWd81V4r1V3K6Xw7qEAwBkD0DgZQWBaBBEiH4GcxTIgmG8JwNcVgMC0B0OuYSQA===';

        // // "Fortress Sudoku" by glum_hippo: Maximum
        // const fPuzzlesB64 = 'N4IgzglgXgpiBcBOANCALhNAbO8QDEB7AJzWJjDAAIBlAVwBNCBrOkVAQzrQAsSEQABR4QsEAA7iqAISx0AtjGRUOzDlQDmc+QH0RkwuxDE6OMDDQCAMjABmaQgDcYxKreKF5VACI0AslQATAAMgQCMAHQAOgB2sQDi5ACeVADGMFhY1KmEMWgcEDFUDBAamNRYHMQaLlS8HEUNKSS8hBq5HJkpHAwAVhzpeVQA7iJoMGkZWBFGGsQQDAgA2kugjp10uGGoZc4xCGSbAL7IwCdnp+dXlzdnALrIq9cXL88g63K4AOw7EHsHJhgzyODyep3eG1wAGZfv94IcgbdgUjwR9NggUCBdjB9vDASDHq9bhDPggACywnEA44oon3QnIukk9HwACslNxCMZBNWzNwFKxfypeJpdO5qMhCAAbBzqYj6WCxbTgaCmWjcDLBXCucT1Qh2VrhTqlQqTeK1pL4AAOWUi+Ugh4geQcAAeEHkCmWoHSmQEACUpQBhQIgc4gH1Yf2s4Oh8ERqOBqGx71Tf1kxPJ8OpvB+9NkzPxnPR1kF7MgAOBqWl305oNfauRouB+thwvl6NWhtpwOd1tlv2BZtdnODqt9mvlwcl8eNyeB/Mz/2DpOLnNWjOr8vrhdx/vr6e7id+9djw+z49DkFHIA';

        // // "Cloneways Game of Life" by ahaupt, Botaku, Ben, Xoned, Philip Newman, Hackiisan, ICHUTES, Qinlux, Gliperal (Killer, Minimum, Maximum, XV, Arrows, Clones)
        // const fPuzzlesB64 = 'N4IgzglgXgpiBcBOANCALhNAbO8QGEsB7AOxgHcBDATzAAIBxSgWxjqIDM6AZCDuVJQCuaABZEATghAA1ShIhEhYEKglCcYGGmkA5Sc0pY6AY2Jk66zXUoAHW1mp0AFCcoBzGPU50xbMCxsJkTEEjYSbBAAJjAkGG5YAJQAOiT6EobGzBAkAPSGAB429o6p6Zl0AIISEkTklhpexQ7UZQZGdAAauTIN1nYtLiREdGTulBgAbkGkYGgSlDloKSQAQtTwqZSiwrZoqatEaJQA1kIHsamdpDBRqQAKohBYELZ0uhSGJKkAEpQmJwgEAC3xIAEl8D8AKoAFQAogBlVIARRyWCEBVSDBethgCywqhA7gUUQQAG0yaATNIAMSrAAMADFGQyQABfZBU2kM5msjlcvA05m8+nszkgamC4Us0X8uWc+XANkAXWQlIl3KZMrFApAdK1fPFkr10sNuqFwrNGqlltlCqNmpFOutep52rlqspiv5LotTu9DsFbqtxv1/oVnvNzMq9JjztD0djdqjjJjcYDSvtmaVkYzvtNyfztp1PoTqaT8dpifTgZN5fTuazparxebNvDKY73sb2cVRa7tb97sHBZLPd9wcLocnJabI9b847/fd4+nBqnjuHvbnna3KtVEvMuHVJhgWCwKngZJAACUAIz4ADMhPv+AALC+AExPr/v38AVhfR8/wPMwbnwM8L3JW9/z/VAb1gwD4IANjg29UKQ9D8GQl8AHZ8EA5VS0gy9rwQtDyMwm9UI/FCCJfVCcPg/DCNQMCyAg89SNvfDcLw/AAA4XwE/A+PgkShPE/BEBfRBBJAIijRI6Cb14/jJNvESxM0+SpJk+C5KE0Cj04qCr1vB9n3gh9aNvb8rLsijvyo4CP0UqllPM187xfB9P1/Hz4O/fzjPAzyyO/bSb2/DSb2AqLgKM4iuJUyLf1i+KgPk0KOPCnT/Kkhybzkgrbzk593IlPKbxE0qap/Az8Dq8qFLYkzqofQKLKagLfxC5KzLI2Cotg2LYJknKYFM7ibzffAutmnr4LmiqBpmuaFrmuqVtaw8wpSrzhpfUbjukhSVUEGo6nJUAXjIUiyJ2+DYNs6j6OY7DhNE2TstA6qtpfHbKrurxySGs7nt0mDvuVP6DvBiafRBh6sKY6G0cWjG5r42G2OqxjzvFZGwcc2Lv307qJrhwbSfOg9shICBmCEZgbqq89pHq/yLpAQomZZtnTw5vBor/AbOfwnyeYKSZBeqiSvpx1BJiMIRcBATp43l77GqVkAVfRdWZHZUCPGPDz4e6ha/N6oKeoPJRsByKbaXpN33cJDhSDQfBXfdt2tct18ips38iu/V7nKytzUEdkHfcFf2A9QL24gTvUk6naqXtOqiaIY97Uf41iQDj5305pTPPe9iuq7WlS1I+2KtK+5uIbK7LY5EeO/f96u097j368OnXobGs6He78vB+TkBU59mes6DjbAaW28ga7p2OMX/uF8TpPA5p0WopirKEs70up+3/e+5Tmud+Hsjaq+oqSp+irN57m+Pbvgfv4DlUbIgA==';

        // // "Sandwich Sudoku" by Cracking the Cryptic https://www.youtube.com/watch?v=2DN32fY63JM (Sandwich)
        // const fPuzzlesB64 = "N4IgzglgXgpiBcBOANCA5gJwgEwQbT2AF9ljSSzKLryBdZQmq8l54+x1p7rjtn/nQaDQANwCGAGwCuceAEZUaCKJgA7BABcMsgdz56uR9sMMjqB42YumrdqrXrhxa7AHcIAYwAWYaQFt8UE8YSUkEEAAlAAYAYXkQVAkZORAADhAKEBCwiJjYgCZEkGTZCIKAZkzSbNDw+Ci4qqSpMob5ADZq4Lq8uIAWYtLU+QBWbtrchvzxlpTyqqyc+sbYrrm2kHlFmuW+2IB2IdbUiuiJvem4jI3UgqOl3qvYxGP5hp2eqaj5WPPbiKdC5PKIFP5vTYPXYgyIVcEAj7A76RfrwkonQGDR7I0Zo4aAhLYlaRDp4jENAqE6HIg5k95bV5EvJpOmbCqfSbExCsu6ZWhEIA=";

        // // "MiniMax Sandwich" by Lisztes (Disjoint, Sandwich, Minimum/Maximum)
        // const fPuzzlesB64 = "N4IgzglgXgpiBcBOANCALhNAbO8QFkIA7CfAQwA8ACAZTKIBMB3CAYwAsRUyBXNdgPYAnBCAAyEMFDQwwXEEJ44wMNKIBywgLZkstHgwEBrHlUXKqZAA5WsATwB0VAKJkOZgU2RVWArDy0ib3oGKgBmCjCqACMBal8iNDJiMCoYN3YqIgDomCEqADMhAS0qAEYqNAEqRDSKN2w7KgEiVhgHAB0iLoARSQArAWI0fUMTMyVZSxt7JwBhGCwsVP4yEesrdPziSvYYKjAyLX2rAUgMFrNFtYgAN32q3ZgIfIYYAt4sEaEYAHMIFqpLQ8MAjIgCEYJJI7fj7Q7HLI5PKdbpEOiMFjuGgGYymcxTDazKgAFT2iK0uSEqQEfEgbyeVF+QggoTAgiYDLAAWaBQZDAg/zQqUOGLYe1CuTQTBgMCI5UsjBqVBh7DWHg5wh8fgCRBRXQA4j8mm0lqkWPxLEJikxUh9WMRfs0+EwyEJQsDQVrEsk5dkKXlUkz0jJ8qs5bo9MJ+AJfi0I00yAx+m5ZZDFss9URDTBjemzZhMq7rba3A7lUQXW6qB7IS1ob6kVSqMoVqrw0tmkJo7GiPHLEmU4kfHmUfImSyEABtSfAAC+yDnC/ni5Xy7XS4AusgZ+vV0v93u51udwfd2fT8fD+er5vtzf72fL9fnxe7y+H7eTx+H0/T3+f1uID8mAgzDEyNJWHI8BoIoMCoCKzBilyWhTqAJpYKIABKAAMcwABzyLcug8LgIBlARy4gOhWG4QA7IRxGkQATPRlHUXgmEAKxzNhDH+MxvFsemWFMTxfEkaITEAGwgEJSw0XMnHiaRFGAVoxAQMCKHwDOVHCRxolMbJC56fJBn4cZaH6SAmF4XMRlyRhHF2RRJnsTZ3FKbOamUJpASoaZTkefZlmBVhdleW51lcRZjkiYpoXuTFiCyRus5AA==";

        // // "Orbit" by Qodec (Arrow, Little Killer, Even/Odd)
        // const fPuzzlesB64 = "N4IgzglgXgpiBcBOANCALhNAbO8QHkAnAI0xFQEMBXNACwHtCEQBFegExgGNyRCqcYGGmYARCAHNMYAAQUs9AHYS5iuYUL0A7jIhq6MGRMIR2MgLZUwaGWCrmZaeo9qH2kzLrXSZXCIS4cADoZcSk0WXMKAE8ZQhgABxgKG3klFQo1Cg1tIIAdRQKwnzTlGXcKCSV5WT13LhSYM2JY7M0tWXoaSE4XQ2NTCysbOwcnPqMIADcYNUV7YhhCORs6FPV2kOKIixi4xOTUhTKKcohK6qx8wsUAYRgsLFktTFo5I3jYvwCcIesZRYyDjsEL3R7PV7vYwwWJgACOVGyhks/0BMBmiiCvAG7AQAG08aAEtlMNFmABRDEgAC+yGAtPpdIZzKZrKJJLQZLw+HYuOpAF1kISWYzRSLxYLhWzxdLpZKxbKFUqBULlYqZfT5RrtXLVTq1WKterjYbVSBiSZOcweXyTfrzRyuSBKbMafzBSAsJhsDAANYQR5LUb40BcB5YZgAJQAjAAGW4Adl4YfB+JAkcQtwAHLxI1nbogQB73PEuBglMwAKqR3hTeRUXAgHMMkApiN4SMAZluceT4bAacjACYC7no9mi6gS9xy4oqwAZWv1xtJlttqPxzt91PwPHp8dD3Mj6OTkDTssQCt4USL1B1rAN5gANhpdNb4ajCduse3T0H+ZPVAM1uQ9i38GdLzna8azvZdmELNcPw7eMk1QNsB13fdbhfICRwAVlzbsABZcyI24tyAvCQNzJ8e1Pc9ZzEW8QHvR88E7Zs33XDsv17ND+0HWjC0oicgLI1D027HD03wsdbhIsDS0YvBK2Y1jGyI1cuKQ/dN1/DC92AkigPzAigK/aTI1oiTIyonMxNHRSIKvEBqyXB8NMPRDHijbsf34ndDLIwD0yow8gNoij0y/Yz01M3NMxfJyLxc0QYJYuC8CIrcVRANptBDT09BgAzDO7GyR0s8czJk+Siw9dDB3KosWy9RQSvxMryNI6iRJCqzqPdAK/0wrtuv5VritK6LupMuqgMzGq82w+rhoMmatwmt82o63dDK/GzaPs0LRwcnMhvfQKZqTLbQB26bbMTHqkoagTRqom7Jvah7uyWsiFNeq6xoI26iu+zqTqigaAbWwcqM2r7doJGaltol7YdGr8QYFakgA";

        // "Quadiagonal" by Tyrgannus (Disjoint, Quad)
        const fPuzzlesB64 = "N4IgzglgXgpiBcBOANCALhNAbO8QEUBXAQwBMJiBzAewDtisRVjC0ALagJwRABUBPTpWK1ahMExCdCOMDDQ8AtADkuAWwYACMIVLUA1oU3TZm4gAdzWfgB1aigMpoRpYp1KbyYAFbUItNE0AdzYYThhPCEpMME0AYxFaakCAIwj/TXYIsGI1CPCwcxg4zAA3CLiYLCxNDLUZDCt8mGi6MDtFAHU2TAqITjjTNwiARxJSWJCwiJhiOLZNMTU0zlraTND4/sGI+rBUiPMCmADtajyp8LWNiqqsWKz4rEJ0h+pCef9KADpJSk4IKQEABtYHAAC+yAhUMh0LhsIRMIAusgwYj4TDMRiISi0Vj0QT8bjsYSScjUWTKQTiaTaUSKXSqeS8UyqTT8Ry2SiQF5fP40P93uYJPA0NIYKgxmRpE0QaBKtURcCQAAlACMAGEABySdUaxC6gBM2qN+pA3NKDBeSrVyAALMgAKzIRBI2EgBX3EGqu0ax2630ANl1jr9IY1wYtVpgNvtyC1LrdUI9dyVqoA7BrDbrMwBmXVarMFjX5qPPGMg3PIdPxxPuz1plWZnWoJtm1uFluqwsGsvWkGG5BVwPVpPy1PevXZ1ua/Ot43T1XG0uoS3l2OD52BscpxWT3Ma9O6g9dlW+o+t306vsV+DAu07huTwMl3Uvu051+tzMfm9Kw2PhOd6qgewatgeF4+hGAaHuaq7Rkqw6AXuwEqsaaqmouKoHhh4FFn+A7IV6qHGmBS6wXhZHYbBBF3oOVY1lqRGNqGH6tqG/qtu+b5hrRwKuvWQHKiqha4d2RatogGpiSqUnZnxVaOm6bpAA=";

        const fPuzzlesDecodedBoard = fPuzzles.parseFpuzzles(fPuzzlesB64);

        const ourBin = binary.writeBuffer(fPuzzlesDecodedBoard);
        await writeFile('./test/board.bin', ourBin);

        let ourLzmaBin = await binary.writeLzmaBuffer(fPuzzlesDecodedBoard);
        const ourB64 = bytesToUrlBase64(ourLzmaBin);
        console.log(ourB64);
        console.log(fPuzzlesB64.length, ourB64.length);

        ourLzmaBin = urlBase64ToBytes(ourB64);
        const ourBoard = await binary.readLzmaBuffer(ourLzmaBin);

        await writeFile('./test/board.json', JSON.stringify(ourBoard, null, 2));
        ourLzmaBin = await binary.writeLzmaBuffer(ourBoard);
        const ourB642 = bytesToUrlBase64(ourLzmaBin);

        expect(ourB64).toEqual(ourB642);

        ourLzmaBin = urlBase64ToBytes(ourB642);
        const ourBoard2 = await binary.readLzmaBuffer(ourLzmaBin);
        expect(ourBoard).toEqual(ourBoard2);
    });
});