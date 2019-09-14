"use strict";
window.addEventListener("load", () => {
    const app = new Vue({
        el: "#app",
        data: {
            newNoteText: "",
            notes: [],
            showNewNoteForm: false,
            formHasError: false,
            formIsValid: false,
            showArchived: false,
            infoMessage: "",
        },
        methods: {
            saveNote() {
                if (this.newNoteText !== "") {

                    this.notes.unshift({
                       text: this.newNoteText,
                       createdAt: new Date(),
                       deleted: false,
                       archived: false,
                    });

                    this.newNoteText = "";
                    this.formHasError = false;
                    this.formIsValid = false;
                    this.showNewNoteForm = false;
                    this.sendNotes();
                } else {
                    this.formHasError = true;
                }
            },
            deleteNote(note) {
                note.deleted = true;
                this.sendNotes();
            },
            restoreNote(note) {
                note.deleted = false;
                this.sendNotes();
            },
            moveToArchive(note) {
                note.archived = true;
                this.sendNotes();
            },
            returnFromArchive(note) {
                note.archived = false;
                this.sendNotes();
            },
            sendNotes(){
               axios.post("https://kos-backend-notes.herokuapp.com/", this.notes.filter(n => !n.deleted))
                   .then((response) => {
                       this.infoMessage = response.data.message;
                       setTimeout(() => { this.infoMessage = "";}, 1800);
                   })
                   .catch(console.log);
            },
        },
        watch: {
            // эта функция вызывается при любом изменении свойства newNoteText
            newNoteText(newValue) {
                this.formIsValid = newValue !== "" && this.showNewNoteForm;
                this.formHasError = newValue === "" && this.showNewNoteForm;
            },
        },
        filters: {
            formatDate(value) {
                const now = new Date(value)
                const padZero = function(n) {
                    return n < 10 ? "0" + n : n;
                };

                const Y = now.getFullYear();
                const m = padZero(now.getMonth() + 1);
                const d = padZero(now.getDate());

                const h = padZero(now.getHours());
                const min = padZero(now.getMinutes());

                return `${d}.${m}.${Y} в ${h}:${min}`;
            }
        },
        computed: {
            filteredNotes() {
                if (this.showArchived) {
                    return this.notes;
                }
                return this.notes.filter(note => !note.archived);
            },
        },
        // функция mounted - это хук жизненного цикла, т.е. специальная функция, которая выполняется в конкретный момент времени
        // mounted выполняется сразу после того, как приложение было первый раз полностью отрисовано
        mounted() {
            // отправляем GET-запрос по указанному адресу
            axios.get("https://kos-backend-notes.herokuapp.com/")
                .then((response) => {
                    // сохраняем в приложение данные, полученные на сервере
                    this.notes = response.data;
                })
                .catch(console.log); // выведет ошибку в консоль, если была ошибка
        },
    });
});
