const el = document.getElementById("quote");
const quote = [
  [
    "WE CHOOSE TO GO TO THE MOON",
    "IN THIS DECADE AND DO THE OTHER THINGS",
    "NOT BECAUSE THEY ARE EASY",
    "BUT BECAUSE THEY ARE HARD",
    "JOHN F. KENNEDY",
    "RICE UNIVERSITY, 1961",
  ],
  [
    "it's too bad she won't live",
    "but then again",
    "who does?",
    "eduardo gaff",
    "blade runner, 1982",
  ],
].map((x) => x.map((y) => y.toUpperCase()).join("*"));

let count = 0;
let i = 0;
let rand = 0; //Math.floor(Math.random() * quote.length);

const typeWriter = () => {
  if (i < quote[rand].length) {
    if (quote[rand].charAt(i) === "*") {
      setTimeout(typeWriter, 1000);
    } else if (quote[rand].charAt(i - 1) === "*") {
      el.innerHTML = quote[rand].charAt(i);
      setTimeout(typeWriter, 100);
    } else {
      el.innerHTML += quote[rand].charAt(i);
      setTimeout(typeWriter, 100);
    }
    i++;
  }
};

el.innerHTML = "";
typeWriter();
