class InteractiveMapChild extends InteractiveMap
{
    toolsExtension;
    preparedField;
    async init(cellId)
    { 
        await super.init(cellId);
        if(this.generalMap.imageId == null)
        {
           this.setImage();
        }
        else
        {         
            await this.callRender();
        }
        this.toolsExtension = new ToolsKeeper([
            {title: "Заменить картинку", call: this.setImage.bind(this)},
            {title: "Режим редактирования", call: this.setRedactorMode.bind(this), radio: true},
            {title: "Отображение как в итоговом ЭОМ", call: this.setStandartEvents.bind(this), radio: true},
            {title: "Местоположение маркеров", call: this.allMoveNotify.bind(this), radio: true}
        ]);   
        return this.mainFieldGrid;
    }
    async instructionsRedactorMode(e)
    {
        let pops = new Popup(1, 1);
        let main = HTML.create("DIV");
        HTML.addStyles(["grid"], [main]);
        main.style.gridTemplateRows = "1fr 10fr";
        let p = HTML.createAndAppend("P", main);
        p.style.textAlign = "center";
        let textEditor;
        p.innerText = "Введите текст задания";
        let div = HTML.createAndAppend("DIV", main);
        div.style.height = "100%";
        await import("/static/ck_box/build/ckeditor.js");
        ClassicEditor.create(div).then(editor => 
            { 
                textEditor = editor; 
                let inst = this.generalMap.textContent;
                editor.setData(inst == "{}" ? "" : inst);
            }).catch(error => 
               {console.error( error );});   
        pops.setSize(50);
        pops.addElement(1, 1, main);
        async function closeInstuction()
        {
            this.generalMap.textContent = textEditor.getData();
            textEditor.destroy();
            await HTML.saveUnit(this.generalMap);
            return true;
        }
        pops.setCloseEvent(closeInstuction.bind(this));
        pops.show();     
    }
    setRedactorMode()
    {
        this.instructions.onclick = this.instructionsRedactorMode.bind(this);
        this.allMarkersNotification((marker) => marker.redactorMode());
    }
    async callRender()
    {
        this.imagesRendering();
        this.map.addEventListener("click", this.createMarkerEvent.bind(this));
    }
    async updateImage(file)
    {
        await UComm.updateImageUnit(file, this.generalMap);
        this.callRender();
    }
    async createMarkerEvent(e)
    {
        let rect = e.target.getBoundingClientRect();
        let unit = await UComm.getEmpty(this.cellId);
        unit.otherJsonOption = {};
        unit.otherJsonOption.x = e.offsetX / rect.width * 100;
        unit.otherJsonOption.y = e.offsetY / rect.height * 100;
        unit.textContent = JSON.parse(unit.textContent);
        this.createSettingPopup(unit);
    }
    async createSettingPopup(unit)
    {
        let popup = new Windows("content-auto");
        let main = HTML.create("DIV");
        HTML.addStyles(['grid', "gapFivePix"],[main]);
        main.style.gridAutoFlow = "column";
        for(let type in this.typeOfMarkers)
        {
            let but = HTML.createAndAppend("BUTTON", main);
            but.innerText = this.typeOfMarkers[type].displayText;
            but.dataset.name = type;
            but.onclick = async ()=>{
                let inside = await UComm.getEmpty(this.cellId);
                inside.tag = "insideMarker";
                popup.close();
                let marker = this.createMarkerInstance(but.dataset.name, unit, inside);
                marker.showPopupSettings();
                this.Markers[but.dataset.name].push(marker);
            };
        }
        popup.setInside(main);
        popup.show();
    }
    setImage()
    {
        this.mainFieldGrid.appendChild(HTML.createFileloaderElement("image/png, image/jpg", this.updateImage.bind(this)));
    }
    async loadUnits()
    {
        this.unit = await UComm.getAllUnits(this.cellId);
        if(this.unit.length == 0)
        {
            this.generalMap = await UComm.getEmpty(this.cellId);
            this.generalMap.tag = "generalMap";
            await UComm.save(this.generalMap);
        }
        else
        {
            super.loadUnits();
        }
    }
    allMoveNotify()
    {
        this.allMarkersNotification((elem)=>elem.moveMarker());
    }
    setTools()
    {
        this.toolsExtension.setDefault();
    }
    getTools()
    {
        return this.toolsExtension;
    }
}