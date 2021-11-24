<script lang="ts">
    interface TImage {
        title: string;
        img: string;
    }
    export let gallary: TImage[]
</script>

<section class="wrapper">
    {#each gallary as image}
        <div class="work">
            <img src={image.img} alt={image.title} />
        </div>
    {/each}
</section>

<style>
    .wrapper {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        padding: 12px;
        column-gap: 10px;
        row-gap: 10px;
    }

    .work {
        width: calc(33.33% - 8.33px);
        overflow: hidden;
    }

    .work img {
        width: 100%;
    }

    @media screen and (max-width: 760px) {
        .wrapper {
            flex-direction: column;
        }

        .work {
            width: 100%;
        }
    }
</style>