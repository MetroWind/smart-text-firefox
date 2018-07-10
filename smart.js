let TextBoxQueries = [
    'input[type="text"]',
    'input[type="search"]',
    'input:not([type])',
    'input[type=""]',
    'textarea',
    // 'div[contenteditable="true"]',
]

function replaceAt(string, index, replace)
{
    return string.substring(0, index) + replace + string.substring(index + 1);
}

function replaceLastN(string, n, replace)
{
    return string.substring(0, string.length-n) + replace;
}

function isOneOf(element, seq)
{
    return seq.indexOf(element) !== -1;
}

function processText(text)
{
    var LastChar = text.slice(-1);
    var PrevChar = text.slice(-2, -1);
    var PrevPrevChar = text.slice(-3, -2);

    // Double quote
    if(LastChar === '"')
    {
        if(isOneOf(PrevChar, " ‘") || text.length == 1)
        {
            console.log("Left double quote");
            text = replaceAt(text, text.length-1, '“');
            console.log("--> " + text);
        }
    }
    else if(isOneOf(LastChar, " '.,!?-;:") && PrevChar === '"')
    {
        console.log("Right double quote");
        text = replaceAt(text, text.length-2, '”');
        console.log("--> " + text);
    }

    // Single quote
    else if(LastChar === "'")
    {
        if(PrevChar === ' ' || text.length == 1)
        {
            console.log("Left single quote");
            text = replaceAt(text, text.length-1, '‘');
            console.log("--> " + text);
        }
        else
        {
            console.log("Right single quote/apostrophe");
            text = replaceAt(text, text.length-1, '’');
            console.log("--> " + text);
        }
    }

    // Dashes
    else if(LastChar === '-')   // Dumb dash
    {
        if(PrevChar === '-')    // Dumb dash
        {
            text = replaceLastN(text, 2, "–"); // En-dash
        }
        else if(PrevChar === '–') // En-dash
        {
            text = replaceLastN(text, 2, "—"); // Em-dash
        }
    }

    else if(LastChar === '.')
    {
        if(PrevChar === '.' && PrevPrevChar === '.')
        {
            text = replaceLastN(text, 3, "…");
            if(text.slice(-2) === "……")
            {
                text = replaceLastN(text, 2, "⋯⋯");
            }
        }
    }

    return text;
}

function textOnChangeValue(event)
{
    event.target.value = processText(event.target.value);
}

function textOnChangeText(event)
{
    event.target.textContent = processText(event.target.textContent);
    // Need a way to maintain cursor position.
}

function bindAll(root_node)
{
    var Texts = root_node.querySelectorAll(TextBoxQueries.join(", "));

    console.log("Binding...");
    for(var i = 0; i < Texts.length; ++i)
    {
        var Text = Texts[i];
        if(Text.tagName.toLowerCase() == "div")
        {
            Text.addEventListener("input", textOnChangeText, false);
        }
        else
        {
            Text.addEventListener("input", textOnChangeValue, false);
        }
    }
}

function onDomChange(mutations)
{
    mutations.forEach(function(mutation) {
        var NewNodes = mutation.addedNodes;
        for(var i = 0; i < NewNodes.length; ++i)
        {
            var NewNode = NewNodes[i];
            bindAll(NewNode);
        }
    });
}

// This content script is injected from manifest.json. The default
// injection point (or run_at) is "document_idle". That means it is
// injected AFTER the document is ready.
bindAll(document);

// Watch for dynamically created textedits.
var Observer = new MutationObserver(onDomChange);
let ToWatch = {childList: true, subtree: true}; // Both are required.
Observer.observe(document.querySelector("body"), ToWatch);
