class PopupMarker extends MarkerSuper
{
    constructor(mainField, unit, insideUnit)
    {
        super(mainField, unit, insideUnit);
    }

    userAction()
    {
        this.marker.onclick = ()=>{
            let buffElement = HTML.create("DIV");
            if(this.insideMarkerUnit != undefined && this.insideMarkerUnit.otherJsonOption != "{}")
                buffElement.innerHTML =  `<h3>${this.insideMarkerUnit.otherJsonOption}</h3>`;
            if(this.insideMarkerUnit != undefined && this.insideMarkerUnit.imageId != null)
                buffElement.innerHTML +=  `<img src ="${this.checkTheImageId(this.insideMarkerUnit.imageId)}" style = "max-width: calc(100% - 2px); border-radius: .4rem; border: 1px solid var(--mainColor);"/>`;
            buffElement.innerHTML += this.insideMarkerUnit != undefined ? this.insideMarkerUnit.textContent : "";
            let popup = new Windows("content-auto");
            popup.setInside(buffElement);
            popup.show();
        };
    }

    moveMarker()
    {
        console.error("Method  'moveMarker' implementation missing!");
    }

    drowMarker()
    {
        super.drowMarker();
        if(this.insideMarkerUnit != undefined && this.insideMarkerUnit.otherJsonOption != "{}")
        {
            if(this.secondMarker == undefined)
            {
                this.secondMarker = HTML.create("DIV");
            }
            HTML.addStyles(["absolute", "border1pix"],[this.secondMarker]);
            this.secondMarker.style.borderRadius = ".5rem";
            this.secondMarker.style.paddingInline = "5px";
            this.secondMarker.style.paddingBlock = "2px";
            this.secondMarker.classList.add("popupOpacity");
            this.secondMarker.innerText = this.insideMarkerUnit.otherJsonOption;
            this.secondMarker.style.zIndex = "450";
            this.secondMarker.style.transform = "translate(0, -50%)";
            this.secondMarker.style.left = this.iMapInstance.map.getBoundingClientRect().width / 100 * this.position.x + ((this.iMapInstance.map.getBoundingClientRect().height / 100 * 5) / 2) + "px";
            this.secondMarker.style.top =  this.iMapInstance.map.getBoundingClientRect().height / 100 * this.position.y + this.iMapInstance.map.getBoundingClientRect().top + window.scrollY + "px";
            this.iMapInstance.mainFieldGrid.appendChild(this.secondMarker);
        }
    }

    checkMarker()
    {
        return null;
    }
    async showPopupSettings()
    {
        super.showPopupSettings();
        let shortText = HTML.createAndAppend("SPAN", this.mainInPopup);
        shortText.innerText = "Краткий текст:";
        let shortInput = HTML.create("INPUT");
        this.mainInPopup.appendChild(shortInput);

        if(this.insideMarkerUnit.otherJsonOption != "{}")
            shortInput.value = this.insideMarkerUnit.otherJsonOption;
        
        let loadImageText = HTML.createAndAppend("SPAN", this.mainInPopup);
        loadImageText.innerText = "Картинка к полному тексту:";
        let imageInput = HTML.createAndAppend("INPUT", this.mainInPopup);
        imageInput.type = "file";
        imageInput.setAttribute("accept", "image/png, image/jpg");
        imageInput.addEventListener("change", ()=>{
            UComm.updateImageUnit(imageInput.files[0], this.insideMarkerUnit);
        });
        let longText = HTML.createAndAppend("SPAN", this.mainInPopup);
        longText.innerText = "Полный текст:";
        let maxi = HTML.createAndAppend("DIV", this.mainInPopup);
        await import("/static/ck_box/build/ckeditor.js");
        ClassicEditor.create(maxi).then( editor => 
            { this.textEditor = editor; 

                if(this.insideMarkerUnit.textContent != "{}")
                    editor.setData(this.insideMarkerUnit.textContent);

                let edWin = document.querySelector(".ck-editor__main");
                edWin.style.height = edWin.getBoundingClientRect().height + "px";
            });
        let deleteButton = HTML.create("BUTTON");
        deleteButton.innerText = "Удалить";
        deleteButton.onclick = ()=>{
            this.deleteHTML(this.marker);
            this.deleteHTML(this.secondMarker);
            UComm.delete(this.id);
            UComm.delete(this.insideMarkerUnit.id);
            this.iMapInstance.Markers[this.tag].splice(this.iMapInstance.Markers[this.tag].indexOf(this), 1);
            this.popup.close();
        };
        this.mainInPopup.appendChild(deleteButton);
        shortInput.addEventListener("change", ()=>{
            this.insideMarkerUnit.otherJsonOption = shortInput.value;
        });
        this.popup.show();
    }
}