import { CancellationToken, cantAttempt, solve } from "../dist/solver-sat";
import { fPuzzles } from "@sudoku-studio/board-format";

describe('Renban Puzzles', () => {
	const boards = [
		[ 'Renban without loop', 'N4IgzglgXgpiBcBOANCA5gJwgEwQbT1DQgDcYA7ABQoGMIAbAWQEMMBrMBcgV3voF9kRUhWrk6TVhy68BQ9CKq0GLdp3g8+g4WSXiVU9Zrk7RyyWplb5xXWImrpG2doV3zjoy5uL7By87WpnoOhlYCALrIhG5m+hZOxq62caEBST7u8Z7hyb4eYYEmsSH+id7BfgleQSVVOUV5WWnltSml1blRMe31hRmVBekVdUOtxb1jNRP52f0jk3PDbbMt002pZeuZm52N3YNL4xsdDQOjR9uHa7k7p/MrzVu318+Nd33LM097SQcXN3er1+C1Wb3Oi0BELBIMeuzOoJ+CLh9y+J0+x3+kPBiPhD2+eLRHymLwBOJRGKuZNhBNRx2Jly60WByNplNJ2Jp6JJQOprO5jN5nP5DKhuLp6yxMJFLPxArFFJ50KRctF5LZSvF7KF0rlUpVRNlhr5qqN9LNVOFppNxqttt1aIiURAGAoACNmOR8KB6BByDB1AQQAAlACMAGFQyBUGHwwAmaMhuPxxPB5NRp38Z3YCBgZhu+gwbD0AD2xBo+BANBL5AALhhmDmaLWIDXOM769wYDRPTnsMxawGSwAHFtt/DO33+70gKcB/B4EMRqMxiMJmPJ9dJyMgJ2oEvcWtz8MIEAAYgAYgAGABsAHZr4mAO44WsACwQV4AdAAWVC5gA5GAn3DNt62YP1awQTsYCzfggA==' ],
		[ 'Renban with loop', 'N4IgzglgXgpiBcBOANCA5gJwgEwQbT1DQgDcYA7ABQoGMIAbAWQEMMBrMBcgV3voF9kRUhWrk6TVhy68BQ9CKq0GLdp3g8+g4WSXiVU9Zrk7RyyWplb5xXWImrpG2doV3zjoy5uL7By87WpnoOhlYCALrIhG5m+hZOxq62caEBST7u8Z7hyb4eYYEmsSH+id7BfgleQSVVOUV5WWnltSml1blRMe31hRmVBekVdUOtxb1jNRP52f0jk3PDbbMt002pZeuZm52N3YNL4xsdDQOjR9uHa7k7p/MrzVu318+Nd33LM097SQcXN3er1+C1Wb3Oi0BELBIMeuzOoJ+CLh9y+J0+x3+kPBiPhD2+eLRHymLwBOJRGKuZNhBNRx2Jly60WByNplNJ2Jp6JJQOprO5jN5nP5DKhuLp6yxMJFLPxArFFJ50KRctF5LZSvF7KF0rlUpVRNlhr5qqN9LNVOFppNxqttt1aIiURAGAoACNmOR8KB6BByDB1AQQAAlACMAGFQyBUGHwwAmaMhuPxxPB5NRmMRqNO/jO7AQMDMN30GDYegAe2INHwIBo5fIABcMMx8zQGxB65xnU3uDAaJ789hmA2A+WAA7tzv4Z2+/3ekCzgP4PAhrOpiMJmPJzdJyPrvdO1Dl7gNxfhhAgADEADEAAwANgA7HfEwB3HANgAWCFvADoACyoAWAByMCvuGnZNswfoNggPYwLm/BAA=' ],
		[ 'Renban with overlap', 'N4IgzglgXgpiBcBOANCA5gJwgEwQbT1DQgDcYA7ABQoGMIAbAWQEMMBrMBcgV3voF9kRUhWrk6TVhy68BQ9CKq0GLdp3g8+g4WSXiVU9Zrk7RyyWplb5xXWImrpG2doV3zjoy5uL7By87WpnoOhlYCALrIhG5m+hZOxq62caEBST7u8Z7hyb4eYYEmsSH+id7BfgleQSVVOUV5WWnltSml1blRMe31hRmVBekVdUOtxb1jNRP52f0jk3PDbbMt002pZeuZm52N3YNL4xsdDQOjR9uHa7k7p/MrzVu318+Nd33LM097SQcXN3er1+C1Wb3Oi0BELBIMeuzOoJ+CLh9y+J0+x3+kPBiPhD2+eLRHymLwBOJRGKuZNhBNRx2Jly60WByNplNJ2Jp6JJQOprO5jN5nP5DKhuLp6yxMJFLPxArFFJ50KRctF5LZSvF7KF0rlUpVRNlhr5qqN9LNVOFppNxqttt1aIiURAGAoACNmOR8KB6BByDB1AQQAAlACMAGFQyBUGHwwAmaMhuPxxPB5NRmMRjMhiMJp38Z3YCBgZhu+gwbD0AD2xBo+BANCr5AALhhmEWaM2IE3OM7W9wYDRPUXsMxmwGqwAHLs9/DO33+70gBcB/B4HOR1O51PJhMx9NbzeZlNO1BV7jNlfhhAgADEADEAAwANgA7E/EwB3HDNgAWCEfAA6AAWVBiwAORgT9wx7VtmD9ZsEH7GAC34IA===' ],
	];

	test.each(boards)('"%s"', async (_name, board64) => {
        const board = fPuzzles.parseFpuzzles(board64, (type, value) => ({ type, value } as any));

        const reason = cantAttempt(board);
        expect(reason).toBeNull();

        const token: CancellationToken = {};
        setTimeout(() => token.cancelled = true, 300_000);

        const solns: IdxMap<Geometry.CELL, number>[] = [];
        const success = await solve(board, 2, soln => {
            if (null == soln) return;
            solns.push(soln);
            if (1 < solns.length) token.cancelled = true;
        }, token);
        expect(success).toBeTruthy();
        expect(solns.length).toBeGreaterThan(0);
	});
});
