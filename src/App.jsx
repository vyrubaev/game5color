import { useState , useMemo, useEffect} from 'react'
import './App.css'
import { polyfill } from 'mobile-drag-drop';
import 'mobile-drag-drop/default.css';
import mqtt from 'mqtt';

// настройка MQTT клиента для подключения к HiveMQ Cloud. ВАЖНО: эти данные должны совпадать с тем, что указано в ESP32, иначе связь работать не будет!
const options = {
  username: 'boyarin', // Тот же, что в ESP32
  password: '2310819Vic',
  clientId: 'react_client_' + Math.random().toString(16).substring(2, 8),
};

const client = mqtt.connect('wss://91e3dbf56f2c402ca4546990a1cfeaa4.s1.eu.hivemq.cloud:8884/mqtt', options);

const sendColorToDevice = (hexColor) => {
  const payload = JSON.stringify({ color: hexColor });
  // Топик должен СОВПАДАТЬ с тем, на который подписана ESP32
  client.publish('game/color', payload); 
  console.log("Отправлено в облако:", payload);
};
function App() {
  useEffect(() => {
    // 1. Запуск полифила для мобилок
    polyfill();
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.disableVerticalSwipes(); // Теперь не упадет в обычном Chrome
    }
  }, []);
  const n=5; // Количество цветов в коде ( если нудно больше цветов, то увеличить setOfcolors)
  const setOfcolors = { 1: 'red', 2: 'blue', 3: 'green', 4: 'yellow', 5: 'pink'}; // Набор доступных цветов. Увеличить если нужно больше цветов
  const [gameKey, setGameKey] = useState(0);
  const [isWinner, setIsWinner] = useState(false);
  const [message, setMessage] = useState('Расставь цвета и нажми проверку!');
  const [userGuess, setUserGuess] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  
  const clickSound = useMemo(() => new Audio('/sounds/click.mp3'), []); //TODO - добавить звуки в папку public/sounds 
  const winSound = useMemo(() => new Audio('/sounds/win.mp3'), []);

  const playClick = () => {
  clickSound.currentTime = 0;
  clickSound.volume = 0.4;
  clickSound.play();
};
  const playWin = () => {
    winSound.currentTime = 0;
    winSound.volume = 0.6;
    winSound.play();
  };
  
  //функция для получения N случайных цветов из набора для заголовка
  const getRandomTitleColors = () => {
    const colors = Object.values(setOfcolors); // ['red', 'blue', ...]
    // Создаем массив цветов длины заголовка, выбирая случайный цвет для каждой буквы
    return "Угадай цвета".split("").map(() => colors[Math.floor(Math.random() * colors.length)]);
  };
  // Состояние, хранящее массив цветов для каждой буквы заголовка
  const [titleColors, setTitleColors] = useState(getRandomTitleColors);

  useEffect(() => {
    const colors = Object.values(setOfcolors);
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    setUserGuess(shuffled);
  }, [gameKey]);
  // Функция для проверки догадки пользователя
  const checkGuess = () => {  
    // Включаем тряску
    setIsShaking(true);
    // Выключаем её через 0.5 секунды, чтобы можно было нажать снова
    setTimeout(() => setIsShaking(false), 500);
    let matches = 0;
    for (let i = 0; i < n; i++) {
      if (userGuess[i] === colorsArray[i]) {
        matches++;
      }
    }
    if (matches === n) {
      playWin(); // Проигрываем звук победы
      setMessage("Поздравляю! Код взломан! 🎉");
      setIsWinner(true);
    } else {
      playClick(); // Проигрываем звук при каждом неправильном ответе
      setMessage(`Угадано позиций: ${matches} из ${n}`);
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
  }, [gameKey]); // Перегенерировать при изменении gameKey

  //отпраыляем цвет в облако цвет в середине секретного кода
  sendColorToDevice(colorsArray[Math.floor(n/2)]);

  const highlightStyle = { //стиль для раскрашивания количества цветов
    color: colorsArray[n-1],
    textShadow: '1px 1px 2px rgba(0,0,0,0.2)', // добавление обЪема на Retina-экране
    padding: '0 5px'
  };

const handleDrop = (targetIndex) => {
  if (draggedIndex === null || draggedIndex === targetIndex) return;

  const newGuess = [...userGuess];
  // Классический swap через временную переменную
  const temp = newGuess[draggedIndex];
  newGuess[draggedIndex] = newGuess[targetIndex];
  newGuess[targetIndex] = temp;
  setUserGuess(newGuess);
  setDraggedIndex(null); // Сбрасываем после обмена
};

  const restartGame = () => {
      //  Генерируем НОВЫЙ секретный код
      setGameKey(prev => prev + 1);
      setTitleColors(getRandomTitleColors());
      setMessage('Расставь цвета и нажми проверку!'); 
      setIsWinner(false);
    };

  return (
    <div>
      <h1>{"Угадай цвета".split("").map((char, index) => (
        <span key={index} style={{ color: titleColors[index] }}>
          {char}
        </span>
        ))}
      </h1>
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
          draggable={!isWinner}
          onDragStart={(e) => {
            setDraggedIndex(index);
            e.dataTransfer.setData("text/plain", index);
            e.dataTransfer.effectAllowed = "move";
            e.stopPropagation();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDragEnter={(e) => {
            e.preventDefault(); 
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(index);
          }}
        >
        </div>
      ))}
    </div>
    <div className={`status-banner ${isWinner ? 'win-text' : ''}`}>
      {message}
    </div>
    <button onClick={checkGuess} 
      className={isShaking ? 'shake-animation' : ''}
      disabled={isWinner}
      >Проверить
    </button>
    <button 
        className="restart-btn"
        onClick={restartGame} 
        style={{ backgroundColor: colorsArray[0],
          color: (colorsArray[0] === 'yellow' || colorsArray[0] === 'pink') ? '#000' : '#fff'
         }}
      >
        Начать сначала 🔄
      </button>
  </section>
  </div>
  );
}

export default App