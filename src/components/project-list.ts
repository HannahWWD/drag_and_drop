// ProjectList class

import {DragTarget} from '../modules/drag-and-drop-interfaces.js'
import {Component} from './base-component.js';
import {Project,ProjectStatus} from '../modules/project-class.js';
import {AutoBind} from '../decorators/autobind.js';
import {projectState} from '../state/project-state.js';
import {ProjectItem} from '../components/project-item.js';




export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: Project[];
  
    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);
  
      this.assignedProjects = [];
  
      // this only adds fn to the ProjectState class
      // fn runs only have project changes
      // refers to the ProjectState class for more
      this.configure();
  
      // this will always runs
      this.renderContent();
    }
  
    @AutoBind
    dragOverHandler(event:DragEvent) {
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
         // the drop event in the target will only fire with the preventDefault() function
          event.preventDefault();
          const listEl = this.elem.querySelector('ul')!;
          listEl.classList.add('droppable');
        }
  
  
    };
  
    @AutoBind
    dropHandler(event:DragEvent) {
        const projectID = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectID, this.type === 'active' ? ProjectStatus.Active:ProjectStatus.Finished)
      //   console.log(event.dataTransfer!.getData('text/plain'))
    };
  
    @AutoBind
    dragLeaveHandler(_event:DragEvent) {
      const listEl = this.elem.querySelector('ul')!;
      listEl.classList.remove('droppable');
  
    }
  
  
    configure() {
        this.elem.addEventListener('dragover',this.dragOverHandler);
        this.elem.addEventListener('dragleave',this.dragLeaveHandler);
        this.elem.addEventListener('drop',this.dropHandler);
  
      projectState.addListener((projects: Project[]) => {
        const relevantProjects = projects.filter((project) => {
          if (this.type === "active") {
            return project.status === ProjectStatus.Active;
          } else {
            return project.status === ProjectStatus.Finished;
          }
        });
        this.assignedProjects = relevantProjects;
        this.renderProjects();
      });
    }
  
    renderContent() {
      const listID = `${this.type}-projects-list`;
      this.elem.querySelector("ul")!.id = listID;
      this.elem.querySelector("h2")!.textContent =
        this.type.toUpperCase() + "PROJECTS";
    }
  
  
    private renderProjects() {
      const listEl = document.getElementById(
        `${this.type}-projects-list`
      )! as HTMLUListElement;
      // clean previous list and re-render each time
      listEl.innerHTML = "";
      for (const item of this.assignedProjects) {
        new ProjectItem(this.elem.querySelector("ul")!.id, item);
      }
    }
  
   
  }