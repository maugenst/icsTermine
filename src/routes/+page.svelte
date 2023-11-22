<script>
    import SveltyPicker from 'svelty-picker';
    import { Input, Label, Button, A, CloseButton, Card } from 'flowbite-svelte';
    import { EnvelopeSolid, TrashBinOutline, EnvelopeOutline } from 'flowbite-svelte-icons';

    let date, dateLong;
    let email;
    let termine = [];

    function addDate() {
        termine = [...termine, {
            date: date,
            dateLong: new Date(date).valueOf()
        }];

        termine.sort((a,b) => a.dateLong - b.dateLong);
    }

    function deleteDate(dateLong) {
        termine = termine.filter(function(item) {
            return item.dateLong !== dateLong
        })

        termine.sort((a,b) => a.dateLong - b.dateLong);
    }

    async function createICAL() {
        const response = await fetch('/api/createICAL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                termine,
                email
            }),
        });

        if (!response.ok) {
            alert('Beim Erstellen der Kalendereinträge ist ein Fehler aufgetreten.');
        }
    }

    function listeLoeschen() {
        termine = [];
        email = undefined;
    }
</script>

<div class="flex justify-center items-center h-screen">
    <Card padding="xl">
        <Label class="text-2xl" for="datePicker">Termin(e) erfassen:</Label>
        <SveltyPicker id="datePicker" class="text-sm" pickerOnly initialDate="{new Date()}" bind:value={date} on:dateChange={addDate} mode="datetime" todayBtn={false} clearBtn={false} format="dd.MM.yyyy hh:ii"/>
        <br>
        <Label class="text-2xl">Patienten Email Adresse: </Label>
        <Input id="email" type="email" bind:value={email} placeholder="patient@email.de" size="lg" required>
            <EnvelopeSolid slot="left" class="w-4 h-4" />
        </Input>
        <br>
        <Label class="text-2xl">Termin Liste:</Label>
        <div class="grid gap-2 grid-cols-3">
            {#each termine as entry, i}
                <div class="col-span-2">
                    {entry.date}
                </div>
                <div class="justify-center items-center">
                    <A on:click={() => {deleteDate(entry.dateLong)}}>
                        <TrashBinOutline />
                    </A>
                </div>
            {/each}
        </div>
        <br>
        {#if (termine.length > 0 && email !== undefined)}
        <div class="grid gap-2 grid-cols-2">
            <div>
                <A on:click={createICAL}>Absenden&nbsp;
                    <EnvelopeOutline />
                </A>
            </div>
            <div>
                <A on:click={listeLoeschen}>Liste l&ouml;schen&nbsp;
                    <TrashBinOutline />
                </A>
            </div>
        </div>
        {/if}
    </Card>
</div>

<style>
    :global(.dark) {
        --sdt-bg-main: #585858;
        --sdt-shadow-color: #777;
        --sdt-color: #eee;
        --sdt-clock-color: var(--sdt-color);
        --sdt-clock-color-hover: var(--sdt-color);
        --sdt-clock-time-bg: transparent;
        --sdt-clock-time-bg-hover: transparent;
        --sdt-clock-disabled: #b22222;
        --sdt-clock-disabled-bg: var(--sdt-bg-main);
        --sdt-clock-selected-bg: var(--sdt-bg-selected);
        --sdt-header-color: #eee;
        --sdt-bg-selected: #e1ac4a;
        --sdt-table-disabled-date: #b22222;
        --sdt-table-disabled-date-bg: var(--sdt-bg-main);
        --sdt-table-data-bg-hover: #777;
        --sdt-table-selected-bg: var(--sdt-bg-selected);
        --sdt-header-btn-bg-hover: #777;
        --sdt-color-selected: #fff;
        --sdt-table-today-indicator: #ccc;
        --sdt-clock-bg: #999;
        /* custom buttons */
        --sdt-today-bg: #e4a124;
        --sdt-today-color: #fff;
        --sdt-clear-color: #666;
        --sdt-clear-bg: #ddd;
        --sdt-clear-hover-color: #fff;
        --sdt-clear-hover-bg: #dc3545;
    }
    :global(.light) {
        --sdt-bg-main: #fff;
        --sdt-shadow-color: #ccc;
        --sdt-color: inherit;
        --sdt-clock-color: var(--sdt-color);
        --sdt-clock-color-hover: var(--sdt-color);
        --sdt-clock-time-bg: transparent;
        --sdt-clock-time-bg-hover: transparent;
        --sdt-clock-disabled: #b22222;
        --sdt-clock-disabled-bg: var(--sdt-bg-main);
        --sdt-clock-selected-bg: var(--sdt-bg-selected);
        --sdt-bg-selected: #286090;
        --sdt-table-disabled-date: #b22222;
        --sdt-table-disabled-date-bg: var(--sdt-bg-main);
        --sdt-table-data-bg-hover: #eee;
        --sdt-table-selected-bg: var(--sdt-bg-selected);
        --sdt-header-btn-bg-hover: #dfdfdf;
        --sdt-color-selected: #fff;
        --sdt-table-today-indicator: #ccc;
        --sdt-clock-bg: #eeeded;
        /* custom buttons */
        --sdt-today-bg: #1e486d;
        --sdt-today-color: #fff;
        --sdt-clear-color: #dc3545;
        --sdt-clear-bg: #fff;
        --sdt-clear-hover-color: #fff;
        --sdt-clear-hover-bg: #dc3545;
    }
</style>
