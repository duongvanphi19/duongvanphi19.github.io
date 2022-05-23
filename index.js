const $ = document.querySelector.bind(document);

const searchAWordAsync = async word => {
    try {
        let resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        let data = await resp.json();
        if (!data.hasOwnProperty("title")) {
            addSuggestions(word);
        }
        return data;
    }catch(error) {
        console.error(error);
    }
};

const addSuggestions = word => {
    try {
        var prevItem = localStorage.getItem("suggestions");
        if (prevItem != null) {
            prevItem = prevItem.split(",");
            if (!prevItem.includes(word)) {
                prevItem.push(word.toLowerCase().trim());
            }
            localStorage.setItem("suggestions", prevItem);
        } else {
            localStorage.setItem("suggestions", new Array(word));
        }
        //console.log(localStorage.getItem("suggestions"));
        console.log(localStorage);
    }catch(error) {
        console.log(error);
    }
};

const searchAWord = async word => {
    const data = await searchAWordAsync(word);
    return data;
};

const addSuggestionsHTML = () => {
    var suggestions = localStorage.getItem("suggestions") || [];
    if (suggestions.length > 0) {
        suggestions = suggestions.split(",");
    }
    console.log(suggestions);
    const searchSuggestions = $("#searchSuggestions");
    const htmls = suggestions.map(word => `<option value="${word}" ></option>`).join("\n");
    searchSuggestions.innerHTML = htmls;
};

const renderMeanings = data => {
    const renderExamples = data => {
        if (!data.hasOwnProperty("example")) {
            return "";
        }
        return `<ul class="list-unstyled"><li class="text-muted"><mark>&#8212; ${data.example}</mark></li></ul>`;
    }
    const renderDefinition = data => {
        return data.map((d, i) => {
            const example = renderExamples(d) || "";
            return `<li class="my-3"><strong class="">${d.definition}</strong>
            ${example}
            </li>`;
        }).join("\n");
    }

    $(".word-title").textContent = data.word;
    $(".phonetic").textContent = data.phonetic || data.phonetics.map(i=>i.text || "")[0];

    const htmls = data.meanings.map(i => {
        const pOS = renderDefinition(i.definitions);
        const item = `<div class="partOfSpeech my-5">
        <p class="h5"><em>${i.partOfSpeech}</em></p>
        <ul class="">
        ${pOS}
        </ul>
        </div>`;
        return item;
    });
    $(".meanings").innerHTML = htmls.join("\n");

};

window.onload = () => {
    //localStorage.removeItem("suggestions");
    $(".search-input").addEventListener("focus",
        addSuggestionsHTML);

    var btn = $("#searchBtn");

    btn.addEventListener("click",
        async () => {
            let word = $(".search-input").value;
            if (word.trim() === "") {
                return;
            }
            $(".meanings").textContent = "Loading...";
            $(".word-title").textContent = "";
            $(".phonetic").textContent = "";
            let data = await searchAWord(word.trim());
            console.log("data", data);
            try {
                renderMeanings(data[0]);
            }catch(error) {
                $(".word-title").textContent = data.title;

            }finally {
                //$(".data").textContent = JSON.stringify(data, null, 2);
            }
        });
}
