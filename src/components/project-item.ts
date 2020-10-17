
// ProjectItem Class
import {Component} from './base-component.js';
import {Draggable} from '../modules/drag-and-drop-interfaces.js';
import {Project} from '../modules/project-class.js';
import {AutoBind} from '../decorators/autobind.js';

export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  private project: Project;

  // The get syntax binds an object property to a function that will be called when that property is looked up
  get numPeople() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} people`;
    }
  }

  constructor(hostID: string, project: Project) {
    super("single-project", hostID, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(event:DragEvent){
      event.dataTransfer!.setData('text/plain',this.project.id);
      // remove from the original place and drop to a new place
      event.dataTransfer!.effectAllowed ='move';
  }

  @AutoBind
  dragEndHandler(_event:DragEvent){
      console.log('drag end')
  }


  configure() {
      this.elem.addEventListener('dragstart',this.dragStartHandler);
      this.elem.addEventListener('dragend',this.dragEndHandler);
  }

  renderContent() {
    this.elem.querySelector("h2")!.textContent = this.project.title;
    this.elem.querySelector("h3")!.textContent = this.numPeople + " assigned";
    this.elem.querySelector("p")!.textContent = this.project.description;
  }
}