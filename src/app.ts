// Drag and Drop interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void; // signal the browser this is a valid drag target;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void; //revert visual update
}

// Project Type
enum ProjectStatus {
  Active,
  Finished,
}

// you can use class as a type
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// project state management

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
   
  }
  
  moveProject(projectId:string,newStatus:ProjectStatus){
      const matchedProject = this.projects.find(project=>project.id === projectId);
      if(matchedProject && matchedProject.status !== newStatus){
          matchedProject.status=newStatus;
          this.updateListeners();
      }
  }

  private updateListeners(){
    for (const listenerFn of this.listeners) {
        // copy the array
        listenerFn(this.projects.slice());
      }
  }
}

const projectState = ProjectState.getInstance();

// interface for validation
interface ValidateObj {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validateInput: ValidateObj) {
  let isValid = true;
  if (validateInput.required) {
    isValid = isValid && validateInput.value.toString().trim().length !== 0;
  }
  if (
    validateInput.minLength != null &&
    typeof validateInput.value === "string"
  ) {
    // if need to be very secured, set validateInput.minLength != null
    // to avoid validateInput.minLength is set to 0 (false)
    // use != instead of !== is to make undefined value counts as null as well
    isValid = isValid && validateInput.value.length >= validateInput.minLength;
  }
  if (
    validateInput.maxLength != null &&
    typeof validateInput.value === "string"
  ) {
    isValid = isValid && validateInput.value.length <= validateInput.maxLength;
  }
  if (validateInput.min != null && typeof validateInput.value === "number") {
    isValid = isValid && validateInput.value >= validateInput.min;
  }
  if (validateInput.max != null && typeof validateInput.value === "number") {
    isValid = isValid && validateInput.value <= validateInput.max;
  }
  return isValid;
}

// autoBind decorator
// using _var ,means to tell TS that you will not use the var, but just need to pass them in the parameters
function AutoBind(
  _target: any,
  _propertyName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    // getter function, which won't be overwritten by the addEventListener function
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustedDescriptor;
}

// component base class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  elem: U;
  constructor(
    templateID: string,
    hostElementID: string,
    insertAtStart: boolean,
    newElementID?: string
  ) {
    this.templateElement = document.getElementById(
      templateID
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementID)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    ); //fragment
    // const elem from the fragment
    this.elem = importedNode.firstElementChild as U;
    if (newElementID) {
      this.elem.id = newElementID;
    }
    this.attach(insertAtStart);
  }
  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.elem
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// ProjectInput class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // property type of the class;
  titleInputElem: HTMLInputElement;
  descriptionInputElem: HTMLInputElement;
  peopleInputElem: HTMLInputElement;

  // A constructor enables you to provide any custom initialization
  // that must be done before any other methods can be called on an instantiated object.
  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElem = this.elem.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElem = this.elem.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElem = this.elem.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    // to solve the problem above, use bind(this) or decorator
    this.elem.addEventListener("submit", this.handleSubmit);
  }

  // satisfy the component class requirements
  renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    // return a tuple or nothing
    const enteredTitle = this.titleInputElem.value;
    const enteredDescription = this.descriptionInputElem.value;
    const enteredPeople = this.peopleInputElem.value;

    const titleValidateObj: ValidateObj = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidateObj: ValidateObj = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidateObj: ValidateObj = {
      value: +enteredPeople,
      required: true,
      min: 1,
    };

    if (
      //   enteredTitle.trim().length === 0 ||
      //   enteredDescription.trim().length === 0 ||
      //   enteredPeople.trim().length === 0
      !validate(titleValidateObj) ||
      !validate(descriptionValidateObj) ||
      !validate(peopleValidateObj)
    ) {
      alert("please try again");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElem.value = "";
    this.descriptionInputElem.value = "";
    this.peopleInputElem.value = "";
  }

  @AutoBind
  private handleSubmit(event: Event) {
    event.preventDefault();
    // this will return undefined since the 'this' keyword is not pointing to the class
    // due to the addEventListener, 'this' will bind to the target of event
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      console.log(title);
      console.log(desc);
      console.log(people);
      this.clearInputs();
    }
  }
}

// ProjectList class

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
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

// ProjectItem Class

class ProjectItem
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
const projectInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
