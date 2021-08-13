<script lang="ts">
    export let visible: boolean;

    function dismiss<T extends EventTarget>(this: T, event: MouseEvent & { currentTarget: EventTarget & T}) {
        if (this === event.target) {
            visible = false;
        }
    }
</script>

<div class="modal-container" hidden={!visible} on:click={dismiss}>
    <div class="modal">
        <slot>This modal is blank.</slot>
    </div>
</div>

<style lang="scss">
    .modal-container {
        z-index: 9999;

        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        background-color: rgba(0,0,0,0.5);
    }

    .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        width: 30rem;
        max-width: 95%;
        padding: 1rem;

        background-color: #fff;
        box-shadow: 0 0.3rem 1rem #000;
        border-radius: 0.3rem;
    }
</style>
