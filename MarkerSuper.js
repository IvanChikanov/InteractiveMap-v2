class MarkerSuper
{
    id;
    tag;
    position;
    marker;
    secondMarker;
    insideMarkerUnit;
    markerImageSrc;
    popup;
    mainInPopup;
    textEditor;
    iMapInstance;
    constructor(iMapInstance, unit, insideUnit)
    {
        this.#insideParse(unit, insideUnit);
        this.setMarkerType(this.constructor.name);
        this.markerImageSrc = unit.imageId;
        this.iMapInstance = iMapInstance;
    }
    #insideParse(unit, insideUnit)
    {
        this.id = unit.id;
        this.tag = unit.tag;
        this.position = {x:unit.otherJsonOption.x, y: unit.otherJsonOption.y};
        this.insideMarkerUnit = insideUnit;
    }
    userAction()
    {
        console.error("Method 'userAction' implementation missing!");
    }

    moveMarker()
    {
        console.error("Method  'moveMarker' implementation missing!");
    }

    drowMarker()
    {
        if(this.marker == undefined)
        {
            this.marker = HTML.create("IMG");
        }
        this.marker.style.position = "absolute";   
        this.marker.src = this.checkTheImageId(this.markerImageSrc);
        this.marker.style.width = this.iMapInstance.map.getBoundingClientRect().height / 100 * 5 + "px";
        this.marker.style.left = this.iMapInstance.map.getBoundingClientRect().width / 100 * this.position.x + "px";
        this.marker.style.top = this.iMapInstance.map.getBoundingClientRect().height / 100 * this.position.y + this.iMapInstance.map.getBoundingClientRect().top + window.scrollY + "px";
        this.marker.style.zIndex = "500";
        this.marker.style.transform = "translate(-50%, -50%)";
        this.marker.classList.add("pointer");
        this.iMapInstance.mainFieldGrid.appendChild(this.marker);
    }

    checkMarker()
    {
        return null;
    }

    chooseMarker(customMarkersArray)
    {
        let markersToShow = customMarkersArray == null? MrkImage.getImage() : MrkImage.getImage().concat(customMarkersArray);
        let pix = HTML.create("DIV");
        HTML.addStyles(["grid", "gapFivePix"],[pix]);
        pix.style.gridTemplateColumns = "repeat(3, 1fr)";
        let pictures = [];
        for(let pic of markersToShow)
        {
            let markDiv = HTML.createAndAppend("DIV", pix);
            markDiv.style.boxSizing = "border-box";
            markDiv.style.borderRadius = ".4rem";
            let img = HTML.createAndAppend("IMG", markDiv);
            img.src = this.#checkTheImageId(pic);
            markDiv.dataset.value = pic;
            pictures.push(markDiv);
        }
        HTML.addStyles(["flexCenter"], pictures);
        function pressMarkerPic(e)
        {
            let el = e.target.tagName == 'IMG'? e.target.parentNode : e.target;
            this.markerImageSrc = el.dataset.value;
        }
        new Radio(pictures, 
            {
            on: function(element){
                let el = element.tagName == 'IMG'? element.parentNode : element;
                el.style.border = "1px solid var(--mainColor)";},
            off: function(element){
                let el = element.tagName == 'IMG'? element.parentNode : element;
                el.style.border = "";
            }},
        pressMarkerPic.bind(this));
        for(let pic of pictures)
        {
            if(pic.dataset.value == this.markerImageSrc)
            {
                pic.dispatchEvent(new Event("click"));
            }
        }
        return pix;
    }
    #checkTheImageId(imageId)
    {
        return isNaN(imageId)? `./media/${imageId}`: `/load_image/${imageId}`;
    }
    showPopupSettings()
    {
        this.popup = new Windows("content-auto");
        let shell = HTML.create("DIV");
        this.mainInPopup = HTML.create("DIV");
        HTML.addStyles(["grid", "gapFivePix"],[this.mainInPopup]);
        this.mainInPopup.appendChild(this.chooseMarker(null));
        shell.appendChild(this.mainInPopup);
        this.popup.setInside(shell);
        this.popup.closeAction(()=>{
            UComm.save(this.preparedUnit()); 
            this.insideMarkerUnit.textContent = this.textEditor.getData();
            UComm.save(this.insideMarkerUnit);
            this.textEditor.destroy(); 
            this.drowMarker();
            return true;});
    }
    customCLosePopupEvent()
    {

    }
    preparedUnit()
    {
        let unit ={
            id: this.id,
            imageId: this.markerImageSrc,
            otherJsonOption: JSON.stringify(this.position),
            tag: this.tag,
            textContent: this.insideMarkerUnit.id
        };
        return unit;
    }
    checkTheImageId(imageId)
    {
        return isNaN(imageId)? `./media/${imageId}`: `/load_image/${imageId}`;
    }
    setMarkerType(type)
    {
        this.tag = type;
    }
    redactorMode()
    {
        this.marker.onclick = this.showPopupSettings.bind(this);
    }
    deleteHTML(html)
    {
        if(html != undefined){
            html.parentNode.removeChild(html);
        }
    }
}