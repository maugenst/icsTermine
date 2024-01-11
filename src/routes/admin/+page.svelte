<script lang="ts">
    import Editor from '@tinymce/tinymce-svelte';
    import logo from "$lib/images/IcsTermineLogo.svg";
    import {
        Button,
        DarkMode,
        Navbar,
        NavBrand,
        NavHamburger,
        NavLi,
        NavUl,
        Textarea,
        Toolbar, ToolbarButton,
        ToolbarGroup
    } from "flowbite-svelte";
    import { page } from '$app/stores';
    $: activeUrl = $page.url.pathname;

    /** @type {import('./$types').PageData} */
    export let data;

    let configData = JSON.stringify(data, null, '\t');

    let apiKey = data.app.tinymce.apikey;
    let conf = {
        "height": 500,
        "plugins": [
            "save", "autolink",
            "lists","link","image","preview","searchreplace",
            "table","help","wordcount"
        ],
        "toolbar": "save | undo redo | casechange blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | " +
            "bullist numlist checklist outdent indent | removeformat | code table help",
        "menubar": false
    }

    function updateContent() {
        console.log(data);
    }
</script>

<div class="flex justify-end top-0">
    <Navbar>
        <NavBrand href="/">
            <img src={logo} class="mr-3 h-6 sm:h-9" alt="Ics Termine" />
            <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Ics Termine</span>
        </NavBrand>
        <NavHamburger />
        <NavUl {activeUrl}>
            <NavLi href="/">Home</NavLi>
            <NavLi href="/admin">Settings</NavLi>
        </NavUl>
    </Navbar>
    <DarkMode />
</div>

<form>
    <main>
        <h1>Kalender Einträge:</h1>
        <Editor
                {apiKey}
                {conf}
                bind:value={data.termine.content}
                on:change={updateContent}
        />
        <h1>Anpassen der Patienten-Email:</h1>
        <Editor
                {apiKey}
                {conf}
                bind:value={data.email.content}
                on:change={updateContent}
        />
    </main>
</form>