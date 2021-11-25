<script>
    export let image
</script>

<picture>
    <source media="(min-width: 769px)"
        srcset="g/{image[0]}.png" 
        type="image/png">
    <source media="(max-width: 768px)" 
        srcset="g/{image[0]}-800.webp"
        type="image/webp">
    <source media="(min-width: 375px)" 
        srcset="g/{image[0]}-400.webp"
        type="image/webp">
    <source media="(max-width: 768px)" 
        srcset="g/{image[0]}-800.png"
        type="image/png">
    <source media="(min-width: 375px)" 
        srcset="g/{image[0]}-400.png"
        type="image/png">
    <img 
        srcset="g/{image[0]}.png 1024w, g/{image[0]}-400.png 375w, g/{image[0]}-800.png 768w"
        sizes="(min-width: 769px) 1024px, (max-width: 768px) 768px, (max-width: 500px) 500px"
        src="g/{image[0]}.png" 
        alt={image[1]}
    />
</picture>

<style>
    picture {
        display: block;
        margin: 0;
        width: 100%;
    }
    img {
        width: 100%;
        height: auto;
    }
</style>