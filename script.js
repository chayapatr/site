let text = new Typewriter(document.getElementById('text'), {
    autoStart: true
});
let d = new Date()
document.getElementById('footer').innerText = `${d.getFullYear()}, chayapatr.com`
text
.typeString('chayapatr archiwaranguprok')
.pauseFor(2500)
.deleteAll()
.pauseFor(1500)
const a = [77, 65, 82, 89, 83]
let c = "";
window.addEventListener('keydown', e => {
    c += e.key
    if (c.includes('maryys')) window.location.href = "https://twitter.com/m_maryys";
    if (c.includes('twitter')) window.location.href = "https://twitter.com/rtapayahc";
    if (c.includes('ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba'))
    document.getElementById('hidden').classList.remove('invisible')
    console.log(c)
})
let random = Math.floor(Math.random() * 11)
const quote = {
    0: [
        [`it was beauty killed the beast.`],
        `carl denham - king kong (1933)`
    ],
    1: [
        [`it's too bad she won't live`, 2000, true, `but the again, `, 500, `who does?`],
        `eduardo gaff - blade runner (1982)`
    ],
    2: [
        [`may the force be with you.`],
        `star wars`
    ],
    3: [
        [`look! these are your brothers.`],
        `maria - metropolis (1927)`
    ],
    4: [
        [`i'll be back.`],
        `T800 - the terminator (1984)`
    ],
    5: [
        [`i see dead people.`],
        `cole sear - the sixth sense (1999)`
    ],
    6: [
        [`here's johnny!`],
        `jack torrance - the shining (1980)`
    ],
    7: [
        [`open the pod bay doors, hal.`],
        `2001: a space odyssey (1968)`
    ],
    8: [
        [`a martini. `, 1000, `shaken, not stirred.`],
        `commander james bond, cmg, rnvr`
    ],
    9: [
        [`it's alive! it's alive!`],
        `victor frankenstein - frankenstein (1931)`
    ],
    10: [
        [`you do not talk about fight club.`],
        `the 1st rule of fight club - fight club (1999)`
    ]
}
const addQuote = (random, num) => {
    quote[random][num].forEach(el => {
        switch (typeof (el)) {
            case "string":
                text.typeString(el);
                break;
            case "number":
                text.pauseFor(el);
                break;
            default:
                text.deleteAll()
        }
    })
    text
        .pauseFor(1000)
        .callFunction(() => {
            let under = new Typewriter(document.getElementById('under'), {
                autoStart: true,
                cursor: '&nbsp'
            });
            under.typeString(quote[random][1]).start()
        })
        .start();
}
addQuote(random, 0, text)