import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Http } from "@angular/http";
import * as Modeler from "bpmn-js/lib/Modeler.js";
import * as propertiesPanelModule from "bpmn-js-properties-panel";
import * as propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/bpmn";
import { ProcessStorage } from "app/Dados/dados";

import { PaletteProvider } from "./palette";
import { CustomPropertiesProvider } from "./props-provider";

const fs = require("fs");
const async = require("async");

const customPaletteModule = {
  paletteProvider: ["type", PaletteProvider]
};

const customPropertiesProviderModule = {
  __init__: ["propertiesProvider"],
  propertiesProvider: ["type", CustomPropertiesProvider]
};

@Component({
  selector: "modeler",
  styleUrls: ["./modeler.component.css"],
  templateUrl: "./modeler.component.html"
})
export class ModelerComponent implements OnInit {
  modeler: any;

  modelText: string;

  constructor(private router: Router, private processStorage: ProcessStorage) {}

  ngOnInit() {
    this.processStorage.resetModel();
    this.modeler = new Modeler({
      container: '#canvas',
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule,
        customPropertiesProviderModule,
        customPaletteModule
      ],
      propertiesPanel: {
        parent: '#js-properties-panel'
      }
    });
    this.modeler.importXML(
      this.processStorage.model,
      (error, definitions) => {}
    );
  }


//abre o ficheiro bpmn 
  openFile(event) {
    const input = event.target;
    for (let index = 0; index < input.files.length; index++) {
      const reader = new FileReader();
      reader.onload = () => {
        this.processStorage.model = reader.result;
        this.modeler.importXML(
          this.processStorage.model,
          (error, definitions) => {}
        );
      };
      reader.readAsText(input.files[index]);
    }
  }

  //valida o nome do ficheiro bpmn, verifica que já esta em uso / se tem nome e regista. 
  validateName() {
    this.modeler.saveXML({ format: true }, (err: any, xml: string) => {
      for (let i = 0; i < this.modeler.definitions.rootElements.length; i++) {
        if (this.modeler.definitions.rootElements[i].$type === 'bpmn:Process') {
          if (this.processStorage.hasModel(this.modeler.definitions.rootElements[i].id)) {
            this.modelText =
              'O ID selecionado ja existe. Por favor escolha outro ID.';
          } else if (!this.modeler.definitions.rootElements[i].name || this.modeler.definitions.rootElements[i].name === '') {
            this.modelText =
              'O Nome do Modelo não pode ser vazio. Renomeie e tente novamente.';
          } else {
            this.goToDashborad();
            this.processStorage.modelId = this.modeler.definitions.rootElements[i].id;
            this.processStorage.registerModel(xml);
            this.modelText =
              'Guardando Modelo. Por Favor aguarde';
          }
          break;
        }
      }
    });
  }

  goToDashborad() {
      this.router.navigateByUrl('/dashboard');
  }
}
