import { useState , useMemo} from 'react'
import './App.css'

function App() {
  const n=5;
  const winState = new Set();
  const setOfcolors = { 1: 'red', 2: 'blue', 3: 'green', 4: 'yellow', 5: 'orange'}
  const [isWinner, setIsWinner] = useState(false);
  const [message, setMessage] = useState('Расставь цвета и нажми проверку!');

  const checkGuess = () => {
    let matches = 0;
    for (let i = 0; i < n; i++) {
      if (userGuess[i] === colorsArray[i]) {
        matches++;
      }
    }
    if (matches === n) {
      //alert("Поздравляю! Ты взломал код! 🎉");
      setMessage("Поздравляю! Код взломан! 🎉");
      setIsWinner(true);
    } else {
      setMessage(`Угадано позиций: ${matches} из ${n}`);
      //alert(`Угадано позиций: ${matches} из ${n}`);
    }
    
  
  }
  const colorsArray = useMemo(() => {
        const winState = new Set();
        while (winState.size < n) {
            const randomNum = Math.floor(Math.random() * n) + 1;
            winState.add(randomNum);
        }
        // Превращаем Set в массив и заменяем числа на цвета
        const result = Array.from(winState).map(num => setOfcolors[num]);
        console.log("Generated Colors:", result);
        return result;
  }, []);

  const highlightStyle = { //стиль для раскрашивания количества цветов
    color: colorsArray[n-1],
    textShadow: '1px 1px 2px rgba(0,0,0,0.2)', // добавление обЪема на Retina-экране
    padding: '0 5px'
  };

  const [userGuess, setUserGuess] = useState(Array(n).fill('#ccc'));
  // Состояние: индекс открытой сейчас ячейки (null если все закрыты)
  const [openSlot, setOpenSlot] = useState(null);

  const handleSelectColor = (slotIndex, newColor) => {
  const newGuess = [...userGuess];
  
  // 1. Ищем, в какой ячейке уже стоит этот цвет (если стоит)
  const existingIndex = newGuess.findIndex(color => color === newColor);

  if (existingIndex !== -1) {
    // 2. Если нашли — меняем местами! 
    // В ячейку, где был этот цвет, ставим тот, что был в текущем слоте
    newGuess[existingIndex] = userGuess[slotIndex];
  }
  // 3. В текущий слот ставим выбранный цвет
  newGuess[slotIndex] = newColor;

  setUserGuess(newGuess);
  setOpenSlot(null);
};
  const restartGame = () => {
      // 1. Сбрасываем выбор пользователя на серые квадраты
      setUserGuess(Array(n).fill('#ccc'));
      
      // 2. Убираем статус победы (анимация остановится)
      setIsWinner(false);
      
      // 3. Закрываем все открытые меню выбора
      setOpenSlot(null);

      // 4. Генерируем НОВЫЙ секретный код
      // Для этого нам нужно обновить ключ или вызвать генерацию. 
      // Самый простой способ в твоем случае — обновить страницу или 
      // использовать специальный state для ключа (но давай пока просто обновим код)
      window.location.reload(); 
    };
  return (
    <div>
      <h1>Угадай цвета</h1>{/*TODO:раскрасить буквы в цвета*/}
      <section className="rules" style={{ textAlign: 'left', padding: '15px', border: '1px solid #fff' }}>
        <h3>Правила «Цветовой код»:</h3>
        <p>🎯 <strong>Цель:</strong> Угадай <span style={highlightStyle}>{n}</span> секретных цветов и их порядок.</p>
        <p>🎨 <strong>Ход:</strong> Расставь свои цвета и нажми «Проверить».</p>
        <p>🔍 <strong>Подсказка:</strong> Ты узнаешь только <strong>количество</strong> верно угаданных позиций.</p>
        <p>🏆 <strong>Победа:</strong> Играй, пока не найдешь все <span style={highlightStyle}>{n}</span> совпадений!</p>
      </section>
      <section className="game-area">
    <div className={`secret-code ${isWinner ? 'winner-jump' : ''}`}>
      {userGuess.map((color, index) => (
        <div 
          key={index} 
          className="color-slot" 
          style={{ backgroundColor: color }}
          onClick={() => setOpenSlot(openSlot === index ? null : index)}
        >
          {/* Если этот слот нажат — показываем меню выбора */}
          {openSlot === index && (
            <div className="options-menu">
              {Object.values(setOfcolors).map((optionColor) => (
                <div
                  key={optionColor}
                  className="option-circle"
                  style={{ backgroundColor: optionColor }}
                  onClick={(e) => {
                    e.stopPropagation(); // Чтобы клик не закрыл меню сразу
                    handleSelectColor(index, optionColor);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
    <div className={`status-banner ${isWinner ? 'win-text' : ''}`}>
      {message}
    </div>
    <button onClick={checkGuess}>Проверить</button>
    <button 
        onClick={restartGame} 
        style={{ backgroundColor: '#f44336' }}
      >
        Начать сначала 🔄
      </button>
  </section>
  </div>
  );
}

export default App

