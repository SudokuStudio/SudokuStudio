<script lang="ts" context="module">
</script>
<script lang="ts">
    import Diagonal from "./constraint/Diagonal.svelte";
    import DisjointGroups from "./constraint/DisjointGroups.svelte";
    import King from "./constraint/King.svelte";
    import Knight from "./constraint/Knight.svelte";
    import Nonconsecutive from "./constraint/Nonconsecutive.svelte";
</script>

<ul class="nolist">
    <li>
        <Diagonal value={{positive: true, negative: false}} />
    </li>
    <li>
        <Knight value={false} />
    </li>
    <li>
        <King value={false} />
    </li>
    <li>
        <DisjointGroups value={false} />
    </li>
    <li>
        <Nonconsecutive value={false} />
    </li>
</ul>
