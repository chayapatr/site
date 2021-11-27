<script context="module">
    export async function load({ page, fetch }) {
        const a = fetch("/work/all")
        console.log(a)
        return {
            prop: {
                a: a
            }
        }
    }
</script>

<script>
    export let a
</script>

<div>{JSON.stringify(a)}</div>