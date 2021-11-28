<script>
    // const getMediumPost = async () => {
    //     const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@chayapatr")
    //         const json = await res.json()
    //         console.log(json)
    //         const items = json.items.map(item => {
    //             return {
    //                 title: item.title,
    //                 link: item.link,
    //                 thumbnail: item.thumbnail,
    //                 date: item.pubDate.split(" ")[0]
    //             }})
    //         return items
    // }
    // let items = getMediumPost()
    const items = [{
        title: "รีวิวการใช้ GPT-3 เขียนการบ้านให้",
        date: "7 October 2021",
        link: "https://chayapatr.medium.com/รีวิวการใช้-gpt-3-เขียนการบ้านให้-abaaed9462a2",
        thumbnail: "https://miro.medium.com/max/4800/1*aOnnz_WNB4kOCw6h3lqa0A.png",
    }, {
        title: "(ไม่) Forgotten: ในความทรงจำของเด็กมัธยมผู้สร้างละครเวที",
        date: "31 May 2021",
        link: "https://chayapatr.medium.com/ไม่-forgotten-ในความทรงจำของเด็กมัธยมผู้สร้างละครเวที-87c9a7af2fb4",
        thumbnail: "https://miro.medium.com/max/2400/1*qGJEo5NpSqftdB-S-LfDwg.png"
    }, {
        title: "Cat T-Shirt 6, คอมพิวเตอร์โอลิมปิกระดับชาติ (TOI15) การจัดบ้านแบบคอนมาริกับเรื่องอื่น ๆ ของครึ่งแรกของปี 2562",
        date: "10 November 2020",
        link: "https://chayapatr.medium.com/cat-t-shirt-6-คอมพิวเตอร์โอลิมปิกระดับชาติ-toi15-การจัดบ้านแบบคอนมาริกับเรื่องอื่น-ๆ-c9edfda1de63",
        thumbnail: "https://miro.medium.com/max/6144/1*MuJOnSLjRsWnuLKLpwprjg.jpeg"
    }, {
        title: "มหากาพย์รีวิวสอวน. คอมพิวเตอร์ปี 2561 ค่าย 1 และค่าย 2 (กรุงเทพฯ)",
        date: "22 March 2020",
        link: "https://chayapatr.medium.com/มหากาพย์รีวิวสอวน-คอมพิวเตอร์ปี-2561-ค่าย-1-และค่าย-2-กรุงเทพฯ-f8047500c8ef",
        thumbnail: "https://miro.medium.com/max/3412/1*aUqkWDIRQnDL8mAsvmXzTQ.jpeg"
    }, {
        title: "Interview with Phoomparin Mano",
        date: "29 January 2020",
        link: "https://chayapatr.medium.com/interview-with-phoomparin-mano-17-january-2019-b6de11de6fd2",
        thumbnail: "https://miro.medium.com/max/1400/1*E-1QiexSA3sF1-zDxvGpZQ.jpeg"
    }]
</script>

<div class="wrapper">
	<h1>Blog</h1>
</div>
<div class="items-wrapper wrapper">
<!-- {#await items then res} -->
{#each items as item}
    <div class="post-wrapper">
        <a href={item.link}>
            <div class="img-wrapper">
                <img src={item.thumbnail} alt="">
            </div>
            <h3 class="title">{item.title}</h3>
            <h3 class="date">{item.date}</h3>
        </a>
    </div>
{/each}
<!-- {/await} -->
</div>

<style>
    .items-wrapper {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    .post-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: left;
        margin-bottom: 20px;
        width: calc(50% - 10px);
    }
    .post-wrapper:hover img {
        transform: scale(1.02);
        transition: 0.3s;
    }
    .img-wrapper {
        width: 100%;
        margin: 0 0 10px;
        overflow: hidden;
    }
    .img-wrapper img {
        object-fit: cover;
        width: 100%;
        aspect-ratio: 16 / 9;
    }
    a {
        text-decoration: none;
    }
    .title {
        color: black;
        text-decoration: none;
        font-size: 25px;
        line-height: 28px;
        margin-bottom: 3px;
    }
    .date {
        color: #828282;
        font-size: 16px;
    }
    @media screen and (max-width: 768px) {
        .items-wrapper {
            flex-direction: column;
        }
        .post-wrapper {
            width: 100%;
        }
    }
</style>