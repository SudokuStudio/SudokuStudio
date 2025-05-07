import type { ArrayObj, Geometry, IdxMap } from '@sudoku-studio/schema';
import { describe, expect, test } from 'vitest';
import { CancellationToken, cantAttempt, solve } from '@sudoku-studio/solver-sat/src';
import { parseSudokuStudio } from '@sudoku-studio/board-format/src';
import { arrayObj2array } from '@sudoku-studio/board-utils/src';

describe('SudokuStudio', () => {
    const boards = [
        // Quadruples by clover!: Quadruples
        // https://sudokupad.app/clover/quadruples-sudoku-gas
        [
            'Quadruples',
            'N4Ig5gTglgJiBcoDusAuALBBOANCdAplGOqtgL54EA2BAtgQHaoDOCoAjOyKgJ4AOBBOGhw8AewgwCEBBwAMHSiABM3PoOGRYAJQJgo4xiAlSZc+fLwA3AIbUArkMQh53N/FQQneLp+8EeGr+PiBYCF6hChEBvn6RgSAcABwxUeEhiSoeCcp+oADMaYkALMV4AKzlScEJvkWZvmWNqvGxqrXtKg25QdwAbNUA7NWpLRxV44PjIy0qzXWqk4sq070gDaAqsytjKxmLBWvtBTsne+0ly5fHoSVnTsrNhTknbaEFnR8Hl69376ULncfqEKn8CMpJoUeicFidrncvqUYXc4aCAZUkZUURC8NNQBU0YkKgjibdEv0cXiiXjSXghliQEMqUyicpZgSHsSgcSQRTyXiuXiefS6UyBUyucoxqB+uC8RiQP1Gf0+fT5UzFUMRUy1SBkuDyEbfB5QBpnOAoNYmGxTNJZPAVNk8vkeAILQAzKDUWhiECSe0IFQKGz2JzuOS+BAlPrwCp4BoqPDNAqVBDJPHYekIfp4MZDPAZJNJDyppJ+XM1LNJBrxpLNAtJSYcXzTDNJWYxpL53wZdvZavByMdaNBBqV+ZBoKTMurBB17aj1RjXCqIsJ0sJvwtjbBOsFccJhsJybto4IMunBCNgpjM8ZLslDyVkp+VclPfJho7krNYtXHNk2mOt7mHEoexAEo+0qDxiwqPwuwqYJVwqBoy0JdNKkmODpnQ2Y6wqFdKgyHc5WvBUl2VQClVralh36SYu36aZK36WZG36MYy1VTCmVg+k33pZD6UPVlyKZU96WmYshk7ekuPpDI6wNORjSrFxzWEABjSRGHMO1zEdSw8k2N1NHgEAtKYVB9P9MwHWyeQ8meMyLR06hJFtOzA3gBQnl/LBVm6U1XOEABHBxbBgbx+FoExvMMjgQxAOxHGcThXQ8Hc/GLYJL2jPJglATckiXT8NhzZyI0dKN4FnecEwoIJMqnUq6tjG902UOcXCy2rcuohohmUA9quy1q8sa+AsBGjlXFavx6vgSshqeFr2rartgk66anhlebfP6jqpuSZQqN64cctjfK43ZUySoQ2N90q+k5v4zbjoq+BTrzKEDuLRbYy7VajWUBhUFsdQoFQOKLIARUi6KHFiggWAAAgAZQcGBxAAawceLbAcDBJG0jzrQgABCeLpBYLToH4VBDGMCyADlJDoew0ZYbG8YcNHvFodHbH4WLeAAOjRgARYhofRqBGDR2w0aQdBoYINGtKgCAtNoNG6AcFhUCV0WCFsCBufEBhVZkDWFbRjANY9cQHAtqyfXRnmIAgF3GBgBWwAdwhNe13WCHFkAjSAA==',
            '145238967236957184789146235492315678378469512651782493823591746514673829967824351',
        ],
        // by Mingwei Samuel: Clone, Thermo, Slow Thermo, Between, Palindrome, Arrow, Sandwich
        [
            'Test 1',
            'N4Ig5gTglgJiBcoDusAuALBBOANCdAplGOqtgL54EA2BAtgQHaoDOCoAjOyKgJ4AOBBOGhw8AewgwCEBBwAMHSiABM3PoOGRYAJQJgo4xiAlSZc+fLwA3AIbUArkMQh53N/FQQneLp+8EeGr+PiBYCF6hChEBvn6RgSAcABwxUeEhiSoeCcp+oADMaYkALMV4AKzlScEJvkWZvmWNqvGxqrXtKg25QdwAbNUA7NWpLRxV44PjIy0qzXWqk4sq070gDaAqsytjKxmLBWvtBTsne+0ly5fHoSVnTsrNhTknbaEFnR8Hl69376ULncfqEKn8CMpJoUeicFidrncvqUYXc4aCAZUkZUURC8NNQBU0YkKgjibdEv0cXiiXjSXghliQEMqUyicpZgSHsSgcSQRTyXiuXiefS6UyBUyucoxqB+uC8RiQP1Gf0+fT5UzFUMRUy1SBkuDyEbfB5QBpnOAoNYmGxTNJZPAVNk8vkeAILQAzKDUWhiECSe0IFQKPLBM3u4QAY0kjHMdvMjsseU2bs08BAkaYqDj/rMDuyVhAdkczk47GU+Jd5d8HLyGWAymD1dU9eUn3LxqSz1TFuj1EkttzgfgIaCFWSzLlhPUEfTtggEHESBMQ4TWELxac3AnJUsWBUFTDIAARg5qMf3AgSko8MfxDBeJf4NffAgwX14BVcBsEP1kp3gxKbIOCAlQZRPM8LxcDwKhvE970faC3w4V94DlD9VTwBptTwZohiGI1OwUfoOAKSwFBTc1hH4ewoEYGBFwYFcAwTdCi3sLcXCOA1CTBIZXQ8XdUPfVQr2/BoKiGXDfwqSoECGEo8XkgpCLibZYOSDhlRnNMeEICA6HEZi8wQMibA40tVDla9+IU7sPELPxv2CFIsKDKSQGaI45OfWSlTfRSmV/Ao8DGBlVK7VZkiwL99x0i1jwIVAkAIJhjOHETN0sgpNOSA0sGi01XAQRy5A/FQ3PgELPKvHy/Omfp6Xk0KEH/AD1KA/LKNnEAWH7JAABV9MM9KEzM9iS24FICpKaKyJTBzUJQ0SR2Whpg2kqrlsmF9/M/ZbZhIlr4CGeQIrAyTtQncd4uEFhbHolBI0weMHQmDcLO4bJ3IAvKDQPCcOR7KN+1jUa3o+yauKGGLkhKLB+mnFxqFsRLqGEABBFc+0kYQAGJj0jCp+n6IQ8FsJ8OGWvxsg/DgsGUKDQA8DaklMwtghUBnCKNIA=',
            '147386529265149738389527461438975612572618943691234857726493185853761294914852376',
        ],
        // by Mingwei Samuel: Min, Max, Column Indexer, Row Indexer, Double Arrow, Region Sum, XV Sum
        [
            'Test 2',
            'N4Ig5gTglgJiBcoDusAuALBBOANCdAplGOqtgL54EA2BAtgQHaoDOCoAjOyKgJ4AOBBOGhw8AewgwCEBBwAMHSiABM3PoOGRYAJQJgo4xiAlSZc+fLwA3AIbUArkMQh53N/FQQneLp+8EeGr+PiBYCF6hChEBvn6RgSAcABwxUeEhiSoeCcp+oADMaYkALMV4AKzlScEJvkWZvmWNqvGxqrXtKg25QdwAbNUA7NWpLRxV44PjIy0qzXWqk4sq070gDaAqsytjKxmLBWvtBTsne+0ly5fHoSVnTsrNhTknbaEFnR8Hl69376ULncfqEKn8CMpJoUeicFidrncvqUYXc4aCAZUkZUURC8NNQBU0YkKgjibdEv0cXiiXjSXghliQEMqUyicpZgSHsSgcSQRTyXiuXiefS6UyBUyucoxqB+uC8RiQP1Gf0+fT5UzFUMRUy1SBkuDyEbfB5QBpnOAoNYmGxTNJZPAVNk8vkeAILQAzKDUWhiECSe0IFQKPLBM3u4QAY0kjHMdvMjssNnsTnYxqSmzdmngIEjTFQcf9Zgd2XkeWeWYt0eokltRcD8BD9KG8jBWFd5qj4kcdEYAElGNIAB6FgMJkoqZOOZycMX9NnKT7yZKfAryDmV4R0WxDkz1hPBqeplyraoFFlDPnpjgT5Kq/r9DiZzs5mDiBwAI1oAEEIBBxEge5jg6YJHjOIAVMkJQFCUHBYK27gICUVhJEhuCqAgkF4A0/RDHgzRDP0yjzBU8FYCUcpQq4SEoX4BQcH0jqThscgFPhSHERUqoGhRVyIfARy+AgpyMQUyTYcJ6HNMhi6EnBWC4cu/HIUJ8CwYxE4SWpbEgNJJRGsRJRYGuMGUeoEY5hA+iGIwADKDh0EBxYIAaYHcCUyQVJ8yROhWHgpKpcGMdkWnBi6CkcDekVUf5DGoYmwXoQ0YnsWpeEQZh/R4gg/QVHkUFYPBj7GfxCiBehwQqOJLECel0lZRl8AkgZQTKkZyTkVx5nZiAQ7WE5DY3sxdjTtw2yYb4wYWJN0whsRzKElBqwdhZID/kgA7DqOzlqcNKbgRUSLpvRVzGeu9HdRadBQMY8YlihI3HlsOIGeQQA===',
            '467538291289716435513942678841253967926874153735169842194385726658427319372691584',
        ],
        // by Mingwei Samuel: Lockout, Max
        [
            'Test 3',
            'N4Ig5gTglgJiBcoDusAuALBBOANCdAplGOqtgL54EA2BAtgQHaoDOCoAjOyKgJ4AOBBOGhw8AewgwCEBBwAMHSiABM3PoOGRYAJQJgo4xiAlSZc+fLwA3AIbUArkMQh53N/FQQneLp+8EeGr+PiBYCF6hChEBvn6RgSAcABwxUeEhiSoeCcp+oADMaYkALMV4AKzlScEJvkWZvmWNqvGxqrXtKg25QdwAbNUA7NWpLRxV44PjIy0qzXWqk4sq070gDaAqsytjKxmLBWvtBTsne+0ly5fHoSVnTsrNhTknbaEFnR8Hl69376ULncfqEKn8CMpJoUeicFidrncvqUYXc4aCAZUkZUURC8NNQBU0YkKgjibdEv0cXiiXjSXghliQEMqUyicpZgSHsSgcSQRTyXiuXiefS6UyBUyucoxqB+uC8RiQP1Gf0+fT5UzFUMRUy1SBkuDyEbfB5QBpnOAoNYmGxTNJZPAVNk8vkeAILQAzKDUWhiECSe0IFQKGz2JzuBDJXwIEp9R14BoFPDNXAgSYVPEIfr0hBDPBjDh4DIZpIebNJPx5mpyepBpox3yTKNJaZJpKzVMpGtJDKp7IINvByNBYLl7q5oLNWNLBAl1Z11SzFRBMZzjLNgplhOVhPBNsFBqpgrNQsbSbTo4TjazfdjcsFXvJjzTkp+U8lYLLkAlBrNkrNEsrmwZNpnfWYX1XZN10qDwvwqPw2wqUdsSvQkB0qJtKmmEsKiXSoC0qR8lQ8Kt+j8adlSzPEGgo5ov36SZT36aZSJvYUqKVYt1WAzVhyZZCmQaKshhTUUG3FWd6VmZttW7IYMi/A0B2NasXHNYQAGNJEYcw7XMR1LDyTY3U0eAQA0phUF0/0zAdbJ5DyZ4TItLTqEkW0bMDeAFGULAsGY+QKiwJS1PdYQ6FsAAPExPP04NQ0cZwtlJFSCiCoKsAmApXXUsy3I0gBrcQHDIPSHTBBLwxcZIhiGDhsrIiN4H6ZtK2bYJ5OlZJjwPEosFNVwg1agcq2CEp7xjKsAKrdNm2mfphNzEsxhEoyH3kOrVShQbvK/Px4tUAcrA2AdU2aApm0mFRU1A1MO2UboOBUILnr6pq5WjeAgrjCoNxjM7Z2O9MlCCFr5metKnNgts3znOR+mUTcf3meRVXxHanU+7K4wfBN/uTGNT3PFREfkK4GQu2SXDLTtc2OjrTwaZUCa+xCYzbVsSieDgsBJZ7+uMjxCU+q443GvGvsArNp0mZkjXloA=',
            '842395671567124839193867452258673914736941285914582367385219746421736598679458123',
        ],
    ];

    const timeout = 300_000;
    test.concurrent.each(boards)(
        '"%s"',
        async (_name, board64, solnStr) => {
            const board = parseSudokuStudio(board64);

            const reason = cantAttempt(board);
            expect(reason).toBeNull();

            const token: CancellationToken = {};
            setTimeout(() => (token.cancelled = true), timeout);

            const solns: IdxMap<Geometry.CELL, number>[] = [];
            const success = await solve(
                board,
                2,
                (soln) => {
                    if (null == soln) return;
                    solns.push(soln);
                    if (1 < solns.length) token.cancelled = true;
                },
                token,
            );
            expect(success).toBeTruthy();

            expect(solns).toHaveLength(1);
            const singleSolnStr = arrayObj2array(solns[0] as ArrayObj<number>).join('');
            expect(singleSolnStr).toEqual(solnStr);
        },
        timeout + 1000,
    );
});
