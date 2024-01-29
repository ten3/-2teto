import {useEffect, useState} from "react";
import classNames from "classnames";
import styles from '../styles/styles.module.css';

const ROWS = 7;
const COLUMNS = 7;
const BLOCK_SIZE = 20;


// テトリミノのパターンの型定義
interface TetriminoPatterns {
    [key: string]: number[][];
}

// テトリミノのパターン
const tetriminoPatterns:TetriminoPatterns = {
    I: [
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    O: [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    T: [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    L: [
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    J: [
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    S: [
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    Z: [
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
};


export default function Base() {
    const [rows, setRows] = useState(16);
    const [columns, setColumns] = useState(16);
    const [board, setBoard] = useState<number[][]>(Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
    const [selectedTetrimino, setSelectedTetrimino] = useState<number[][] | null>(null);
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0); // 追加: 得点の状態

    useEffect(() => {
        // Initialize the game board with filled cells
        const newBoard = Array.from({ length: rows }, () => Array(columns).fill(0));

        setBoard(newBoard);
        setScore(0)
        selectRandomTetrimino();
    }, [columns, rows]);

    useEffect(() => {
        // Check for game over when selected tetrimino changes
        if (selectedTetrimino) {
            const gameIsOver = !canPlaceTetriminoForAnyRotation(selectedTetrimino);
            setIsGameOver(gameIsOver);
        }
    }, [selectedTetrimino]);

    const canPlaceTetriminoForAnyRotation = (tetrimino: number[][]) => {
        let rotatedTetrimino = tetrimino;
        for (let rotation = 0; rotation < 4; rotation++) {
            rotatedTetrimino = makeRotateeMatrix(rotatedTetrimino);
            if (canPlaceTetriminoForAnyPosition(rotatedTetrimino)) {
                return true;
            }
        }
        return false;
    };

    const canPlaceTetriminoForAnyPosition = (tetrimino: number[][]) => {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                if (canPlaceTetrimino(row, col, tetrimino)) {
                    return true;
                }
            }
        }
        return false;
    };

    const handleBoardChange = () => {
        // ボード変更ボタンがクリックされたときの処理
        const newBoard = Array.from({ length: rows }, () => Array(columns).fill(0));
        // ... (同じ)
        setBoard(newBoard);
        selectRandomTetrimino();
        setScore(0)
        setIsGameOver(false); // ゲームがリセットされたのでゲームオーバー状態を解除
    };

    const getRandomTetrimino = () => {
        const tetriminoKeys = Object.keys(tetriminoPatterns);
        const randomKey = tetriminoKeys[Math.floor(Math.random() * tetriminoKeys.length)];
        return tetriminoPatterns[randomKey];
    };

    const selectRandomTetrimino = () => {
        const randomTetrimino = getRandomTetrimino();
        setSelectedTetrimino(randomTetrimino);
    };

    const canPlaceTetrimino = (row: number, col: number, tetrimino: number[][]) => {
        for (let i = 0; i < tetrimino.length; i++) {
            for (let j = 0; j < tetrimino[i].length; j++) {
                const newRow = row + i;
                const newCol = col + j;

                // 1の部分がエリア外にはみ出す場合は配置不可
                if (tetrimino[i][j] === 1 && (newRow >= rows || newCol >= columns)) {
                    return false;
                }

                // 1の部分が他のtetriminoと重なる場合は配置不可
                if (tetrimino[i][j] === 1 && board[newRow][newCol] === 1) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleCellMouseEnter = (row: number, col: number) => {
        console.log("mouse over cell", row, col)
        setHoveredCell({ row, col });
    };

    const handleCellMouseLeave = () => {
        setHoveredCell(null);
    };

    const handleCellClick = (row: number, col: number) => {
        // ゲームオーバー状態であればクリックを無視
        if (isGameOver) {
            return;
        }
        // Clone the board to avoid mutating state directly
        const newBoard = board.map((row) => [...row]);
        let pointsEarned = 0; // 追加: 得点の初期化


        // Check if there is a selected tetrimino
        if (selectedTetrimino) {
            // Check if placing the tetrimino on the board is valid
            if (
                canPlaceTetrimino(row, col, selectedTetrimino)
            ) {
                // Place the tetrimino on the board
                for (let i = 0; i < selectedTetrimino.length; i++) {
                    for (let j = 0; j < selectedTetrimino[i].length; j++) {
                        // Update only where tetrimino has 1
                        if (selectedTetrimino[i][j] === 1) {
                            newBoard[row + i][col + j] = 1;
                            pointsEarned += 1; // 追加: タイルが設置されたら得点を増やす
                        }
                    }
                }

                setBoard(newBoard);
                setScore((prevScore) => prevScore + pointsEarned * 100); // 追加: 得点を加算
                selectRandomTetrimino();
            }
        }
    };

    const rotateTetrimino = () => {
        if (selectedTetrimino) {
            const rotatedTetrimino = makeRotateeMatrix(selectedTetrimino);
            setSelectedTetrimino(rotatedTetrimino);
        }
    };

    const rotateMatrix = (matrix: number[][]) => {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotatedMatrix: number[][] = [];

        for (let col = 0; col < cols; col++) {
            const newRow: number[] = [];
            for (let row = rows - 1; row >= 0; row--) {
                newRow.push(matrix[row][col]);
            }
            rotatedMatrix.push(newRow);
        }

        return rotatedMatrix;
    };

    const shiftToTopLeft = (matrix: number[][]) => {
        const firstNonZeroCol = matrix.reduce((minCol, row) => {
            const firstNonZero = row.findIndex(cell => cell === 1);
            if (firstNonZero !== -1 && (minCol === -1 || firstNonZero < minCol)) {
                return firstNonZero;
            }
            return minCol;
        }, -1);
        const firstNonZeroRow = matrix.findIndex(row => row.some(cell => cell === 1));

        const shiftedMatrix: number[][] = [];
        for (let i = firstNonZeroRow; i < matrix.length; i++) {
            const newRow = matrix[i].slice(firstNonZeroCol);
            shiftedMatrix.push(newRow);
        }

        return shiftedMatrix;
    };

    const padTo4x4 = (matrix: number[][]) => {
        const paddedMatrix: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));

        const rows = matrix.length;
        const cols = matrix[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (i < 4 && j < 4 && matrix[i][j] === 1) {
                    paddedMatrix[i][j] = 1;
                }
            }
        }

        return paddedMatrix;
    };


    const makeRotateeMatrix = (matrix: number[][]) => {
        const roteedMatrix = rotateMatrix(matrix);


        const shifted = shiftToTopLeft(roteedMatrix);

        const paddedMatrix = padTo4x4(shifted);

        const rotatedAndPackedMatrix = paddedMatrix;
        return rotatedAndPackedMatrix;
    };

    const renderSelectedTetrimino = () => {
        if (!selectedTetrimino) {
            return null;
        }

        return (
            <div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {selectedTetrimino.map((row, rowIndex) => (
                        <div key={rowIndex} style={{ display: 'flex' }}>
                            {row.map((cell, columnIndex) => (
                                <div
                                    key={columnIndex}
                                    style={{
                                        width: 20 , // 300px
                                        height: 20, // 20px
                                        backgroundColor: cell === 1 ? 'blue' : 'transparent',
                                        border: '1px solid #ccc',
                                        boxSizing: 'border-box',
                                        margin: 0,
                                        padding: 0,
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    const renderBoard = () => {
        return (
            <div style={{ display: 'flex' }}>
                <div>
                    {board.map((row, rowIndex) => (
                        <div key={rowIndex} style={{ display: 'flex' }}>
                            {row.map((cell, columnIndex) => (
                                <div
                                    key={columnIndex}
                                    className={classNames(styles.cell, {
                                        [styles.cellHovered]:
                                        hoveredCell &&
                                        selectedTetrimino &&
                                        rowIndex - hoveredCell.row >= 0 && // ガード: 行が負の値にならないように
                                        rowIndex - hoveredCell.row < selectedTetrimino.length && // ガード: 行が selectedTetrimino の範囲外にならないように
                                        columnIndex -  hoveredCell.col >= 0 && // ガード: 列が負の値にならないように
                                        columnIndex -  hoveredCell.col < selectedTetrimino[0].length && // ガード: 列が selectedTetrimino の範囲外にならないように
                                        selectedTetrimino[rowIndex - hoveredCell.row][columnIndex - hoveredCell.col] === 1,
                                    })}
                                    style={{
                                        width: BLOCK_SIZE,
                                        height: BLOCK_SIZE,
                                        backgroundColor: cell === 1 ? 'blue' : 'black',
                                        boxSizing: 'border-box',
                                        margin: 0,
                                        padding: 0,
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={() => handleCellMouseEnter(rowIndex, columnIndex)}
                                    onMouseLeave={handleCellMouseLeave}
                                    onClick={() => handleCellClick(rowIndex, columnIndex)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div>
                        <h2>得点エリア</h2>
                        <p>Score: {score}</p>
                        {/* ここに得点表示のコンポーネントを追加 */}
                    </div>
                    <div>
                        <h2>予告エリア</h2>
                        {renderSelectedTetrimino()}
                    </div>
                    <div>
                        <h2>ボタン設置エリア</h2>
                        <button onClick={rotateTetrimino}>回転ボタン</button>
                        {/* 他のボタンも追加する場合はここに追加 */}
                        <div>
                            <label>行数: </label>
                            <input type="number" value={rows} onChange={(e) => setRows(parseInt(e.target.value, 10))} />
                        </div>
                        <div>
                            <label>列数: </label>
                            <input type="number" value={columns} onChange={(e) => setColumns(parseInt(e.target.value, 10))} />
                        </div>
                        <button onClick={handleBoardChange}>ボード変更/リセット</button>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div>
            <h1>Tetris Game</h1>
            {renderBoard()}
            {isGameOver && <div>ゲームオーバー</div>}
        </div>
    );
}
