import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // Автоматически определит язык браузера
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "title": "Color Code",
          "rules": "Rules of the game:",
          "rule1": "🎯 Mission: Crack the secret combination of {{count}} colors",
          "rule2": '🎨 Move: Arrange your colors and click "Check".',
          "rule3": "🔍 Hint: You will only know the number of positions you guessed correctly.",
          "rule4_1": "🏆 Victory: Play until you find all ",
          "rule4_2": "matches!",
          "msgToDo": "Arrange the colors and press check!",
          "statusMsg": "Matches: {{matchesCount}} out of {{total}}",
          "check": "Check",
          "win": "Congratulations! You've cracked the code! 🎉",
          "restart": "Restart Game 🔄"
          
          
        }
      },
      ru: {
        translation: {
          "title": "Цветовой код",
          "rules": "Правила игры:"  ,
          "rule1": "🎯  Цель: Угадай секретную комбинацию из {{count}} цветов",
          "rule2": "🎨 Ход: Расставь свои цвета и нажми «Проверить».",
          "rule3": "🔍 Подсказка: Ты узнаешь только количество верно угаданных позиций.",
          "rule4_1": "🏆 Победа: Играй, пока не найдешь все ",
          "rule4_2": "совпадений!",
          "msgToDo": "Расставь цвета и нажми проверку!",
          "statusMsg": "Угадано {{matchesCount}} из {{total}}",
          "check": "Проверить",
          "win": "Поздравляем! Вы взломали код! 🎉",
          "restart": "Начать заново 🔄"
          
          
        }
      }
    },
    fallbackLng: "en", // Если язык не определен, будет английский
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
