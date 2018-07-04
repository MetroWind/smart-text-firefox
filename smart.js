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

function textOnChange(event)
{
    var Text = event.target.value;
    
    var LastChar = Text.slice(-1);
    var PrevChar = Text.slice(-2, -1);
    var PrevPrevChar = Text.slice(-3, -2);

    // Double quote
    if(LastChar === '"')
    {
        if(isOneOf(PrevChar, " ‘") || Text.length == 1)
        {
            console.log("Left double quote");
            Text = replaceAt(Text, Text.length-1, '“');
            console.log("--> " + Text);
        }
    }
    else if(isOneOf(LastChar, " '.,!?-;:") && PrevChar === '"')
    {
        console.log("Right double quote");
        Text = replaceAt(Text, Text.length-2, '”');
        console.log("--> " + Text);
    }

    // Single quote
    else if(LastChar === "'")
    {
        if(PrevChar === ' ' || Text.length == 1)
        {
            console.log("Left single quote");
            Text = replaceAt(Text, Text.length-1, '‘');
            console.log("--> " + Text);
        }
        else
        {
            console.log("Right single quote/apostrophe");
            Text = replaceAt(Text, Text.length-1, '’');
            console.log("--> " + Text);
        }
    }

    // Dashes
    else if(LastChar === '-')   // Dumb dash
    {
        if(PrevChar === '-')    // Dumb dash
        {
            Text = replaceLastN(Text, 2, "–"); // En-dash
        }
        else if(PrevChar === '–') // En-dash
        {
            Text = replaceLastN(Text, 2, "—"); // Em-dash
        }
    }

    else if(LastChar === '.')
    {
        if(PrevChar === '.' && PrevPrevChar === '.')
        {
            Text = replaceLastN(Text, 3, "…");
            if(Text.slice(-2) === "……")
            {
                Text = replaceLastN(Text, 2, "⋯⋯");
            }
        }
    }
    
    event.target.value = Text;
}

function bindAll(root_node)
{
    var Texts = root_node.querySelectorAll('input[type="text"], input[type="search"], input:not([type]), input[type=""], textarea');

    for(var i = 0; i < Texts.length; ++i)
    {
        console.log("Binding...");
        var Text = Texts[i];
        Text.addEventListener("keyup", textOnChange, false);
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
