<script lang="ts">
    import Carousel from '../Components/Carousel.svelte'
    import Gallary from '../Components/Gallary.svelte'
    const talks = [
        {
            title: "TEDxUTCC 2021",
            img: "tedsq.jpg"
        },{
            title: "Hacktoberfest 2020",
            img: "hacktoberfest.png"
        },
        {
            title: "bangkok citycity gallary",
            img: "bccg.png"
        }
    ]
    const works = [
        {
            title: "MESSE",
            img: "messe.png"
        },{
            title: "Recursive Mono Thai",
            img: "recthai.png"
        },
        {
            title: "bkkjs",
            img: "bkkjs.png"
        }, {
            title: "the 5th stupid hackathon thailand",
            img: "sht5.png"
        },{
            title: "spaceth",
            img: "spaceth.png"
        },
        {
            title: "forgotten",
            img: "forgotten.png"
        },{
            title: "toi15",
            img: "toi.png"
        },{
            title: "forgotten",
            img: "forgotten.png"
        },{
            title: "forgotten",
            img: "forgotten.png"
        },
    ]
</script>

<div class="wrapper">
    <div class="introduction">
        <h1>Hello! My name is Chayapatr. I'm an antidisciplinary creator based in Bangkok, Thailand</h1>
    </div>
    <div class="title-wrapper">
        <img src="profile.jpeg" alt="" />
        <h2 class="me-large">&lt;- (This is me)</h2>
        <h1 class="me-small">^ (This is me)</h1>
    </div>
</div>
<div class="wrapper">
    <h1>Works/Projects</h1>
</div>
<Gallary gallary={works} />
<div class="wrapper">
    <h1>Talks/Keynotes</h1>
</div>
<Gallary gallary={talks} />
    
<style>
    .wrapper {
        padding: 0 15px;
    }
    .introduction {
        max-width: 80%;
    }
    .title-wrapper {
        display: flex;
        align-items: flex-end;
        margin: 30px 0;
    }
    img {
        width: calc(66.66% - 8.33px);
        aspect-ratio: 2 / 1;
        object-fit: cover;
        margin-right: 30px;
    }
    .me-small {
        display: none;
    }
    @media screen and (max-width: 768px) {
        .introduction {
            max-width: 100%;
        }
        .title-wrapper {
            flex-direction: column;
            align-items: flex-start;
        }
        .title-wrapper img {
            width: 100%;
            height: auto;
            margin-right: 0;
            margin-bottom: 10px;
            aspect-ratio: 1 / 1;
        }
        .me-small {
            display: block;
        }
        .me-large {
            display: none;
        }
    }
</style>