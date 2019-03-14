// @ts-ignore
var text = new Typewriter(document.getElementById('text'), {
    autoStart: true
});
var d = new Date();
document.getElementById('footer').innerText = d.getFullYear() + ", chayapatr.com";
text
    .typeString('chayapatr archiwaranguprok')
    .pauseFor(2500)
    .deleteAll()
    .pauseFor(1500);
var c = "";
window.addEventListener('keydown', function (e) {
    c += e.key;
    if (c.indexOf('maryys') >= 0)
        window.location.href = "https://twitter.com/m_maryys";
    if (c.indexOf('twitter') >= 0)
        document.getElementById('twitter').classList.remove('invisible');
    if (c.indexOf('countdown') >= 0) {
        setInterval(function () {
            document.getElementById('countdown').innerText = "ycc camp : " + updateTime(1553821200000);
        }, 1000);
    }
    if (c.indexOf('ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba') >= 0)
        document.getElementById('hidden').classList.remove('invisible');
    if (c.indexOf('clear') >= 0) {
        c = '';
        // TODO : something cool
    }
});
var updateTime = function (el) {
    var countdown = Math.floor((el - Date.now()) / 1000);
    var day = Math.floor(countdown / 86400);
    var hour = Math.floor((countdown % 86400) / 3600);
    var minute = Math.floor((countdown % 3600) / 60);
    var sec = (countdown % 3600) % 60;
    return day + "d " + hour + "h " + minute + "m " + sec + "s";
};
var random = Math.floor(Math.random() * 11);
var quote = {
    0: [
        ["it was beauty killed the beast."],
        "carl denham - king kong (1933)"
    ],
    1: [
        ["it's too bad she won't live", 2000, true, "but then again, ", 500, "who does?"],
        "eduardo gaff - blade runner (1982)"
    ],
    2: [
        ["may the force be with you."],
        "star wars"
    ],
    3: [
        ["look! these are your brothers."],
        "maria - metropolis (1927)"
    ],
    4: [
        ["i'll be back."],
        "T800 - the terminator (1984)"
    ],
    5: [
        ["i see dead people."],
        "cole sear - the sixth sense (1999)"
    ],
    6: [
        ["here's johnny!"],
        "jack torrance - the shining (1980)"
    ],
    7: [
        ["open the pod bay doors, hal."],
        "david bowman - 2001: a space odyssey (1968)"
    ],
    8: [
        ["a martini. ", 1000, "shaken, not stirred."],
        "commander james bond, cmg, rnvr"
    ],
    9: [
        ["it's alive! it's alive!"],
        "victor frankenstein - frankenstein (1931)"
    ],
    10: [
        ["you do not talk about fight club."],
        "the 1st rule of fight club - fight club (1999)"
    ]
};
var addQuote = function (random, num) {
    quote[random][num].forEach(function (el) {
        switch (typeof (el)) {
            case "string":
                text.typeString(el);
                break;
            case "number":
                text.pauseFor(el);
                break;
            default:
                text.deleteAll();
        }
    });
    text
        .pauseFor(1000)
        .callFunction(function () {
        // @ts-ignore
        var under = new Typewriter(document.getElementById('under'), {
            autoStart: true,
            cursor: '&nbsp'
        });
        under.typeString(quote[random][1]).start();
    })
        .start();
};
addQuote(random, 0);
