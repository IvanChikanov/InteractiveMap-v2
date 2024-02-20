class InteractiveMap
{
    cellId;
    unit;
    Markers = {};
    generalMap;
    mainFieldGrid;
    instructions;
    relColumn = null;
    relationColumn = false;
    map;
    relationCount = 0;
    checkButtonEnabled = false;
    checkButton;
    typeOfMarkers = 
    {
        "ContextMarker": 
            {create: function(iMap, unit, insideUnit){ 
                return new ContextMarker(iMap, unit, insideUnit)}, 
                displayText: "Контекстный"
            },
        "PopupMarker": 
            {create:  function(iMap, unit, insideUnit){ 
            return new PopupMarker(iMap, unit, insideUnit)}, 
            displayText: "Попап"
            },
        "RelationMarker": 
            {create:  function(iMap, unit, insideUnit){
                iMap.relationCount++; 
                iMap.updateRelation();
                iMap.checkButtonAdd();
                return new RelationMarker(iMap, unit, insideUnit)}, 
                displayText: "Связи"
            },
        "RadioMarker": 
            {create:  function(iMap, unit, insideUnit){ 
                return new PopupMarker(iMap, unit, insideUnit)}, 
                displayText: "Радио"
            },
        "CheckboxMarker": 
            {create:  function(iMap, unit, insideUnit){ 
                return new PopupMarker(iMap, unit, insideUnit)}, 
                displayText: "Чекбокс"
            }
    }
    insideMarkersArray = [];
    async init(cellId)
    {
        this.cellId = cellId;
        this.createMainField();
        this.setMainFieldStyles();
        await this.loadUnits();
        return this.mainFieldGrid;
    }
    setMainFieldStyles()
    {
        this.mainFieldGrid.innerHTML = "";
        this.mainFieldGrid.style.gridTemplateRows = "repeat(2, auto)";
        this.mainFieldGrid.style.gap = "5px";
        this.mainFieldGrid.style.width = "100%";
        this.instructions = HTML.createAndAppend("BUTTON", this.mainFieldGrid);
        this.instructions.style.gridArea = "1/1/1/2";
        this.instructions.style.marginBlock = "5px";
        this.instructions.innerText = "Прочитать задание";
    }
    setRelationColumn()
    {
        if(!this.relationColumn)
        {
            this.relationColumn = true;
            this.instructions.style.gridArea = "1/1/1/3";
            this.mainFieldGrid.style.gridTemplateColumns = "80% 20%";
            this.relColumn = HTML.createAndAppend("DIV", this.mainFieldGrid);
            this.relColumn.style.gridArea = "2/2/3/3";
            this.relColumn.style.display = "grid";
            this.relColumn.style.gridAutoFlow = "row";
            this.relColumn.style.gap = "5px";   
            this.relColumn.style.height = this.relColumn.getBoundingClientRect().height + "px";
            this.allMarkersNotification((marker)=>marker.drowMarker());
        }
    }
    createMainField()
    {
        this.mainFieldGrid = HTML.create("DIV");
        HTML.addStyles(["grid", "maxWidthInherit", "widthInherit"],[this.mainFieldGrid]);
    }
    
    paintLines(color = "red")
    {
        for(let relMarker of this.relationMarkers)
        {
            relMarker.line.setAttribute("stroke", color);
        }
    }
    originalInstructionHandler()
    {
        let insider = HTML.create("DIV");
        insider.innerHTML = this.generalMap.textContent;
        let popup = new Windows("content-auto");
        popup.setInside(insider);
        popup.show();
    }
    setStandartEvents()
    {
        this.instructions.onclick = this.originalInstructionHandler.bind(this);
        this.allMarkersNotification((elem)=>elem.userAction());
    }
    imagesRendering()
    {
        if(this.mainFieldGrid.querySelector("input"))
        {
            this.mainFieldGrid.removeChild(this.mainFieldGrid.querySelector("input"));
        }
        if(this.map == undefined)
        {
            this.map = HTML.createAndAppend("IMG", this.mainFieldGrid);
        }
        this.map.src = `/load_image/${this.uncashedPicture(this.generalMap.imageId)}`;
        this.map.style.gridArea = "2/1/3/1";
        HTML.addStyles(["maxWidthInherit", "widthInherit", "border1pix", "bRadius04rem", "borderBox"], [this.map]);   
    }
    createMarkerInstance(type, unit, insideUnit)
    {
        this.createMarkersArr(this.Markers, type);
        let marker = this.typeOfMarkers[type].create(this, unit, insideUnit);
        return marker;

    }
    createMarkersArr(data, type)
    {
        if(!(type in data))
        {
            data[type] = [];
        }
    }
    setData(data)
    {
        this.unit = data.moduleUnits;
    }
    async loadUnits()
    {
        console.time("time");
        let loadBuffer = {};
        for(let un of this.unit)
        {
            switch(un.tag)
            {
                case "generalMap":
                    this.generalMap = un;
                    break;
                case "RelationMarker":
                case "RadioMarker":
                case "CheckboxMarker":
                case "PopupMarker":
                case "ContextMarker":
                    this.createMarkersArr(loadBuffer, un.tag);
                    loadBuffer[un.tag].push(un);
                    break;
                case "insideMarker":
                    if(!("insideMarker" in loadBuffer))
                    {
                        loadBuffer["insideMarker"] = new Map();
                    }
                    loadBuffer["insideMarker"].set(un.id.toString(), un);
                    break;
                case "customSvg":

                    break;
                default:
                    console.warn(`unit {${un.id}|${un.tag}} is indefined and will be deleted`);
                    UComm.delete(un.id);
                    break;
            }
        }
        this.imagesRendering()
        this.map.onload = ()=>{
            this.unitFactory(loadBuffer);
            this.setTools();
        };
        console.timeEnd("time");
    }
    unitFactory(buffer)
    {
        for(let oneType in buffer)
        {
            if(oneType != "insideMarker")
            {
                for(let oneUnit of buffer[oneType])
                {
                    try
                    {
                        oneUnit.otherJsonOption = JSON.parse(oneUnit.otherJsonOption);
                    }
                    catch(except)
                    {
                        continue;
                    }
                    let marker = this.createMarkerInstance(oneType, oneUnit, buffer["insideMarker"].get(oneUnit.textContent));
                    this.Markers[oneType].push(marker);
                    marker.drowMarker();
                }
            }
        }
    }
    allMarkersNotification(workFunction, except = [])
    {
        for(let mkrType in this.Markers)
        {
            if(!except.includes(mkrType))
            {
                for(let marker of this.Markers[mkrType])
                {
                    workFunction(marker);
                }
            }
        }
    }
    setTools()
    {
        this.setStandartEvents();
    }
    updateRelation(event = (marker)=> marker.updateSpanSize())
    {
        this.allMarkersNotification(event, ["PopupMarker", "ContextMarker", "RadioMarker", "CheckboxMarker"]);
    }
    checkButtonAdd()
    {
        if(!this.checkButtonEnabled)
        {
            let result = true;
            this.checkButton = HTML.createAndAppend("BUTTON", this.mainFieldGrid);
            this.checkButton.innerText = "Проверить";
            this.checkButton.style.gridArea = "3/1/4/3";
            this.checkButton.style.justifySelf = "center";
            function check(marker)
            {
                let res = marker.checkMarker();
                if(res != null)
                {
                    if(!res)
                    {
                        result = res;
                    }
                }    
            }
            this.checkButton.onclick = ()=>{
                this.allMarkersNotification(check.bind(this));
                this.showEndInfo(result);
            };

        }
    }
    showEndInfo(result)
    {
        this.updateRelation((marker)=>marker.paintLine(result));
        let endPopup = new Windows("content-auto");
        let shell = HTML.create("DIV");
        shell.style.textAlign = "center";
        let endText = result? "Все верно! Молодец!": "Неверно. Поробуй еще!";
        let h1 = HTML.create("H1");
        h1.innerText = endText;
        shell.appendChild(h1);
        endPopup.setInside(shell);
        endPopup.show();
    }
    uncashedPicture(imageLink)
    {
        return isNaN(imageLink)? `${imageLink}`: `${imageLink}?${Math.random()}`;
    }
}