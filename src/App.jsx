import { useState , useMemo, useEffect} from 'react'
import './App.css'
import { polyfill } from 'mobile-drag-drop';
import 'mobile-drag-drop/default.css';
import mqtt from 'mqtt';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@vercel/analytics/react';

// Словарь-переводчик: Название -> HEX-код
const colorHexMap = {
  'red': '#FF0000',
  'blue': '#0000FF',
  'green': '#00FF00',
  'yellow': '#FFFF00',
  'pink': '#FFC0CB', // Добавил розовый, так как он есть в твоем наборе
  'black': '#000000',
  'white': '#FFFFFF'
};

// настройка MQTT клиента для подключения к HiveMQ Cloud. ВАЖНО: эти данные должны совпадать с тем, что указано в ESP32, иначе связь работать не будет!
const options = {
  username: import.meta.env.VITE_MQTT_USER,
  password: import.meta.env.VITE_MQTT_PASS,
  clientId: 'react_client_' + Math.random().toString(16).substring(2, 8),
};

const client = mqtt.connect('wss://91e3dbf56f2c402ca4546990a1cfeaa4.s1.eu.hivemq.cloud:8884/mqtt', options);

const sendColorToDevice = (inputColor) => {
  // Ищем HEX в нашем словаре. Если не нашли — отправляем черный по умолчанию.
  const hexColor = colorHexMap[inputColor] || '#000000';
  const payload = JSON.stringify({ color: hexColor });
  client.publish('game/color', payload); 
  console.log("Отправлено на ESP32:", inputColor, "->", hexColor);
};

function App() {
  // добавление перевода приложения 
  const { t, i18n } = useTranslation();
  //var count;

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };

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
  const [message, setMessage] = useState(t('msgToDo'));
  const [userGuess, setUserGuess] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  
  useEffect(() => {
  setMessage(t('msgToDo'));
}, [i18n.language]);
  /*
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
  */
  //функция для получения N случайных цветов из набора для заголовка
  const getRandomTitleColors = () => {
    const colors = Object.values(setOfcolors); // ['red', 'blue', ...]
    // Создаем массив цветов длины заголовка, выбирая случайный цвет для каждой буквы
    return t('title').split("").map(() => colors[Math.floor(Math.random() * colors.length)]);
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
      //playWin(); // Проигрываем звук победы
      setMessage(t('win'));
      setIsWinner(true);
    } else {
      //playClick(); // Проигрываем звук при каждом неправильном ответе
      setMessage(t('statusMsg', {matchesCount: matches, total: n}));
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
        //console.log("Generated Colors:", result);
        return result;
  }, [gameKey]); // Перегенерировать при изменении gameKey

  

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
  sendColorToDevice(newGuess[targetIndex]);
  setUserGuess(newGuess);
  setDraggedIndex(null); // Сбрасываем после обмена
};

  const restartGame = () => {
      //  Генерируем НОВЫЙ секретный код
      setGameKey(prev => prev + 1);
      setTitleColors(getRandomTitleColors());
      setMessage(t('msgToDo')); 
      setIsWinner(false);
    };
    
  return (
    <div>
      <Analytics />
      <div className='header-wrapper'>
        <div className="header-spacer"></div> 
        <h1 className="main-title">{t('title').split("").map((char, index) => (
          <span key={index} style={{ color: titleColors[index] }}>
            {char}
          </span>
          ))}
        </h1>
        <button className="lang-toggle" onClick={toggleLanguage}>
          {i18n.language === 'en' ? 'RU' : 'EN'}
        </button>
      </div>  
      <section className="rules" style={{ textAlign: 'left', padding: '15px', border: '1px solid #fff' }}>
        <h3>{t('rules')}</h3>
        <p>{t('rule1', {count: n})}</p>
        <p>{t('rule2')}</p>
        <p>{t('rule3')}</p>
        <p>{t('rule4_1')}<span style={highlightStyle}>{n}</span> {t('rule4_2')}</p>
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
      >{t('check')}
    </button>
    <button 
        className="restart-btn"
        onClick={restartGame} 
        style={{ backgroundColor: colorsArray[0],
          color: (colorsArray[0] === 'yellow' || colorsArray[0] === 'pink') ? '#000' : '#fff'
         }}
      >
        {t('restart')}
      </button>
  </section>
  </div>
  );
}

export default App
