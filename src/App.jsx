import { useState , useMemo} from 'react'
import './App.css'

function App() {
    const n=5;
    const winState = new Set();
    const setOfcolors = { 1: 'red', 2: 'blue', 3: 'green', 4: 'yellow', 5: 'orange'}
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

  return (
    <div>
      <h1>Угадай цвета</h1>{/*TODO:раскрасить буквы в цвета*/}
    </div>
  );
}

export default App

