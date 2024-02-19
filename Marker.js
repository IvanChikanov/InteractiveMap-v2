class Marker
{
    id;
    tag;
    position;
    type;
    imageType;
    marker;
    miniText;
    maxiText;
    secondMarkerElement;
    changedSecond = null;
    relMarkers;
    clicked = false;
    line = null;
    constructor(unit)
    {
        this.position = {x:unit.otherJsonOption.x, y: unit.otherJsonOption.y};
        this.type = "type" in unit.otherJsonOption? unit.otherJsonOption.type : ""; 
        this.imageType = unit.imageId;
        this.miniText = "min" in unit.textContent? unit.textContent.min : "";
        this.maxiText = "max" in unit.textContent? unit.textContent.max : "";
        this.id = unit.id;
        this.tag = "marker";
        this.marker = HTML.create("img");
        this.secondMarkerElement = HTML.create("div");
    }
    render(rect)
    {
        this.marker.style.position = "absolute";   
        this.marker.src = this.checkTheImageId(this.imageType);
        this.marker.style.width = rect.height / 100 * 5 + "px";
        this.marker.style.left = rect.width / 100 * this.position.x + "px";
        this.marker.style.top = rect.height / 100 * this.position.y + rect.top + window.scrollY + "px";
        this.marker.style.zIndex = "500";
        this.marker.style.transform = "translate(-50%, -50%)";
        this.marker.classList.add("pointer");
        if(this.type != "rel")
        {
            HTML.addStyles(["absolute", "border1pix"],[this.secondMarkerElement]);
            this.secondMarkerElement.style.borderRadius = ".5rem";
            this.secondMarkerElement.style.paddingInline = "5px";
            this.secondMarkerElement.style.paddingBlock = "2px";
            this.secondMarkerElement.classList.add("popupOpacity");
            this.secondMarkerElement.innerText = this.miniText;
            this.secondMarkerElement.style.zIndex = "450";
            this.secondMarkerElement.style.transform = "translate(0, -50%)";
            this.secondMarkerElement.style.left = rect.width / 100 * this.position.x + ((rect.height / 100 * 5) / 2) + "px";
            this.secondMarkerElement.style.top =  rect.height / 100 * this.position.y + rect.top + window.scrollY + "px";
        }
        else
        {
            HTML.addStyles(["border1pix", "bRadius04rem", "borderBox", "padding5px"],[this.secondMarkerElement]);
            this.secondMarkerElement.style.zIndex = "500";
            this.secondMarkerElement.style.background = "white";
        }
        return [this.marker, this.secondMarkerElement];
    }
    static async updateSize(column, relationMarkers)
    {
            let rect = column.getBoundingClientRect();
            relationMarkers.forEach(item => this.WordsCutter(item, rect, relationMarkers.size));
    }
    static async WordsCutter(rel, rect, size)
    {
        rel.secondMarkerElement.innerHTML = "";
        rel.secondMarkerElement.style.maxWidth = rect.width + "px";
        rel.secondMarkerElement.style.overflow = "hidden";
        rel.secondMarkerElement.style.height = rect.height / size - 5 + "px";
        let div = HTML.createAndAppend("SPAN", rel.secondMarkerElement);
        HTML.addStyles(["fullScreenSize", "overFlow"], [div]);
        div.innerHTML = rel.maxiText;
        div.style.wordWrap = "break-word";
        let text = div.textContent;
        div.innerHTML = "";
        for(let char of text)
        {
            div.innerHTML += char;
            if(div.getClientRects()[0].height * div.getClientRects().length > rel.secondMarkerElement.clientHeight - 10)
            {
                let all = div.textContent.split(" ");
                all.pop();
                let buff = all.join(" ");
                div.innerHTML = buff.slice(0, -3) + "...";
                break;
            }
        }
    }
    check()
    {
        if(this.changedSecond == this.secondMarkerElement)
        {
            return true;
        }
        return false;
    }
    setRelMarkers(markersSet){
        this.relMarkers = markersSet;
    }
    setClickEvent(eventFunc = this.standartEvent.bind(this))
    {
        this.marker.onclick = eventFunc;
    }
    standartEvent()
    {
        switch(this.type)
        {
            case "pop":
                let buffElement = HTML.create("DIV");
                buffElement.innerHTML = `<h3>${this.miniText}</h3>`;
                buffElement.innerHTML += this.maxiText;
                let popup = new Windows("content-auto");
                popup.setInside(buffElement);
                popup.show();
                break;
            case "ctx":
                let buff = HTML.create("DIV");
                buff.innerHTML = this.maxiText;
                let ctx = new Windows("freePosition");
                ctx.setInside(buff);
                ctx.show(this.marker);
                break;
            case "rel":
                if(this.line != null)
                {
                    this.line.dispatchEvent(new Event("click"));
                } 
                for(let rel of this.relMarkers)
                {
                    if(rel.clicked)
                    {
                        rel.unRelClicked()
                    }
                    rel.secondMarkerElement.onclick = ()=>{   
                        this.drawRelation(rel);
                        this.unRelClicked();
                    };
                }
                this.relClicked()
                break;
        }
    }
    drawRelation(element)
    {
        this.changedSecond = element.secondMarkerElement;
        this.changedSecond.style.border = "1px solid #183B59";
        let markerRect = this.marker.getBoundingClientRect();
        let changedRect = this.changedSecond.getBoundingClientRect();
        let markTop = (markerRect.top + markerRect.height / 2 + window.pageYOffset);
        let changedTop =(changedRect.top + changedRect.height / 2 + window.pageYOffset);
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.position = "absolute";
        svg.style.zIndex = "400";
        svg.style.left = parseInt(this.marker.style.left) + "px";
        svg.style.top = (markTop <= changedTop? markTop : changedTop) - 3 + "px";
        svg.style.width = (changedRect.left + changedRect.width / 4) - (markerRect.left + markerRect.width / 2) + "px";
        markTop <= changedTop? this.lineDirection(svg, changedRect, markerRect) : this.lineDirection(svg, markerRect, changedRect);
        this.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.line.setAttribute("x1", 0);
        this.line.setAttribute("y1", markTop <= changedTop? 3 : parseInt(svg.style.height) - 3);
        this.line.setAttribute("x2", parseInt(svg.style.width));
        this.line.setAttribute("y2", markTop <= changedTop? parseInt(svg.style.height) - 3 : 3);
        this.line.setAttribute("stroke", "#183B59");
        this.line.setAttribute("stroke-width", "6"); 
        svg.appendChild(this.line);
        this.line.onclick = ()=>{
            svg.parentNode.removeChild(svg);
            this.changedSecond.style.border = "";
            this.line = null;
            this.changedSecond = null;
        };
        this.marker.parentNode.appendChild(svg);
    }
    lineDirection(svg, upperElement, downedElement)
    {
        svg.style.height = (upperElement.top + upperElement.height / 2) - (downedElement.top + downedElement.height / 2) + 6 + "px";
    }
    relClicked()
    {
        this.marker.style.transform = "translate(-50%, -50%) scale(1.3, 1.3)";
        this.clicked = true;
    }
    unRelClicked()
    {
        this.clicked = false;
        this.marker.style.transform = "translate(-50%, -50%)";
        for(let relMarker of this.relMarkers)
        {
            relMarker.secondMarkerElement.onclick = null;
        }
    }
    prepareToUnit()
    {
        let unit ={
            id: this.id,
            imageId: this.imageType,
            otherJsonOption: JSON.stringify(Object.assign({}, this.position, {imageType: this.imageType, type: this.type})),
            tag: this.tag,
            textContent: JSON.stringify({min: this.miniText, max: this.maxiText}),
        };
        return unit;
    }
    deleteMarker()
    {
        this.marker.parentNode.removeChild(this.marker);
        this.secondMarkerElement.parentNode.removeChild(this.secondMarkerElement);
    }
    checkTheImageId(imageId)
    {
        return isNaN(imageId)? `./media/${imageId}`: `/load_image/${imageId}`;
    }
}