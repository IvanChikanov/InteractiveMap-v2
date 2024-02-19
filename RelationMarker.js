class RelationMarker extends MarkerSuper
{
    span;
    chosedSecondMarker;
    line;
    markerConnection;
    constructor(mainField, unit, insideUnit)
    {
        super(mainField, unit, insideUnit);
    }

    userAction()
    {
        this.marker.onclick = ()=>{
            this.iMapInstance.updateRelation((rel)=>rel.unClick());
            this.marker.style.transform = "translate(-50%, -50%) scale(1.3, 1.3)";
            if(this.chosedSecondMarker != undefined)
            {
                this.line.dispatchEvent(new Event("click"));
            }
            for(let secRelElement of this.iMapInstance.Markers[this.tag])
            {
                secRelElement.secondMarker.onclick = ()=>{
                    if(secRelElement.markerConnection != undefined)
                    {
                        secRelElement.markerConnection.line.dispatchEvent(new Event("click"));
                    }
                    secRelElement.markerConnection = this;
                    this.chosedSecondMarker = secRelElement.secondMarker;
                    this.iMapInstance.updateRelation((rel)=>rel.userAction());
                    this.iMapInstance.updateRelation((rel)=>rel.unClick());
                    this.chosedSecondMarker.style.border = "1px solid #183B59";
                    let markerRect = this.marker.getBoundingClientRect();
                    let changedRect = this.chosedSecondMarker.getBoundingClientRect();
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
                        this.chosedSecondMarker.style.border = "";
                        this.line = undefined;
                        this.chosedSecondMarker = undefined;
                        secRelElement.markerConnection = undefined;
                    };
                    this.marker.parentNode.appendChild(svg);
                };
            }
        };
        this.secondMarker.onclick = ()=>{
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
    lineDirection(svg, upperElement, downedElement)
    {
        svg.style.height = (upperElement.top + upperElement.height / 2) - (downedElement.top + downedElement.height / 2) + 6 + "px";
    }
    moveMarker()
    {
        console.error("Method  'moveMarker' implementation missing!");
    }

    drowMarker()
    {
        this.iMapInstance.setRelationColumn();
        super.drowMarker();
        if(this.insideMarkerUnit != undefined && this.insideMarkerUnit.textContent != "{}")
        {
            if(this.secondMarker == undefined)
            {
                this.secondMarker = HTML.create("DIV");
            }
            HTML.addStyles(["border1pix", "bRadius04rem", "borderBox", "padding5px"],[this.secondMarker]);
            this.secondMarker.style.zIndex = "500";
            this.secondMarker.style.background = "white";
            this.secondMarker.style.overflow = "hidden";
            this.iMapInstance.relColumn.appendChild(this.secondMarker);
            this.secondMarker.innerHTML = "";
            this.span = HTML.createAndAppend("SPAN", this.secondMarker);
            HTML.addStyles(["fullScreenSize", "overFlow"], [this.span]);
            this.span.style.wordWrap = "break-word";
            this.span.innerHTML = this.insideMarkerUnit.textContent;
            this.updateSpanSize();
        }
    }
    updateSpanSize()
    {
        let rect = this.iMapInstance.relColumn.getBoundingClientRect();
        this.secondMarker.style.height = rect.height / this.iMapInstance.relationCount - ((this.iMapInstance.relationCount - 1) * 5 / this.iMapInstance.relationCount) +"px";
        let text = this.span.textContent;
        this.span.innerHTML = "";
        for(let char of text)
        {
            this.span.innerHTML += char;
            if(this.span.getClientRects()[0].height * this.span.getClientRects().length >= this.secondMarker.clientHeight - 10)
            {
                let all = this.span.textContent.split(" ");
                all.pop();
                let buff = all.join(" ");
                this.span.innerHTML = buff.slice(0, -3) + "...";
                break;
            }
        }
    }
    checkMarker()
    {
        if(this.line != null)
        {
            if(this.secondMarker == this.chosedSecondMarker)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }
    async showPopupSettings()
    {
        super.showPopupSettings();
              
        let loadImageText = HTML.createAndAppend("SPAN", this.mainInPopup);
        loadImageText.innerText = "Картинка к полному тексту:";
        let imageInput = HTML.createAndAppend("INPUT", this.mainInPopup);
        imageInput.type = "file";
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
            this.iMapInstance.relationCount--;
            this.iMapInstance.Markers[this.tag].splice(this.iMapInstance.Markers[this.tag].indexOf(this), 1);
            this.iMapInstance.updateRelation();
            this.popup.close();
        };
        this.mainInPopup.appendChild(deleteButton);
        this.popup.show();
    }
    unClick()
    {
        this.marker.style.transform = "translate(-50%, -50%)";
    }
    paintLine(result)
    {
        let color = result? "green": "red";
        this.line.setAttribute("stroke", color);
        this.secondMarker.style.border = `1px solid ${color}`;
    }
}