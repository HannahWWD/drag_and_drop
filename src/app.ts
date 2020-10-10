// Project Type
enum ProjectStatus {Active,Finished}

// you can use class as a type
class Project{
    constructor(
        public id:string,
        public title:string,
        public description:string,
        public people:number, 
        public status:ProjectStatus){

    }
}


type Listener = (items:Project[]) =>void;

// project state management

class ProjectState{
    private listeners:Listener[]=[]
    private projects:Project[]=[];
    private static instance:ProjectState;

    private constructor(){

    }

    static getInstance(){
        if(this.instance){
            return this.instance
        }
        this.instance = new ProjectState();
        return this.instance
    }
    addProject(title:string,description:string,numOfPeople:number){
        const newProject = new Project(Math.random().toString(),title,description,numOfPeople,ProjectStatus.Active )
        this.projects.push(newProject);
        for(const listenerFn of this.listeners){
            // copy the array
            listenerFn(this.projects.slice())
        }
    }
    addListener(listenerFn:Listener){
        this.listeners.push(listenerFn)

    }
   
}


const projectState = ProjectState.getInstance()

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

// ProjectInput class
class ProjectInput {
  // property type of the class;
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  elem: HTMLFormElement;
  titleInputElem: HTMLInputElement;
  descriptionInputElem: HTMLInputElement;
  peopleInputElem: HTMLInputElement;

  // A constructor enables you to provide any custom initialization
  // that must be done before any other methods can be called on an instantiated object.
  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    ); //fragment
    // const elem from the fragment
    this.elem = importedNode.firstElementChild as HTMLFormElement;
    this.elem.id = "user-input";
    this.titleInputElem = this.elem.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElem = this.elem.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElem = this.elem.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    // return a tuple or nothing
    const enteredTitle = this.titleInputElem.value;
    const enteredDescription = this.descriptionInputElem.value;
    const enteredPeople = this.peopleInputElem.value;

    const titleValidateObj:ValidateObj = {
        value:enteredTitle,
        required:true
    }
    const descriptionValidateObj:ValidateObj = {
        value:enteredDescription,
        required:true,
        minLength:5
    }
    const peopleValidateObj:ValidateObj = {
        value:+enteredPeople,
        required:true,
        min:1
    }

    if (
    //   enteredTitle.trim().length === 0 ||
    //   enteredDescription.trim().length === 0 ||
    //   enteredPeople.trim().length === 0
    !validate(titleValidateObj) || !validate(descriptionValidateObj) || !validate(peopleValidateObj)
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
      projectState.addProject(title,desc,people)
      console.log(title);
      console.log(desc);
      console.log(people);
      this.clearInputs();
    }
  }

  private configure() {
    // to solve the problem above, use bind(this) or decorator
    this.elem.addEventListener("submit", this.handleSubmit);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.elem);
  }
}

// ProjectList class

class ProjectList{
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    elem: HTMLElement;
    assignedProjects:Project[];

    constructor(private type:'active' | 'finished'){
        this.templateElement = document.getElementById(
            "project-list"
          )! as HTMLTemplateElement;
          this.hostElement = document.getElementById("app")! as HTMLDivElement;
          this.assignedProjects = [];
      
          const importedNode = document.importNode(
            this.templateElement.content,
            true
          ); //fragment
          // const elem from the fragment
          this.elem = importedNode.firstElementChild as HTMLFormElement;
          this.elem.id = `${this.type}-projects`
          // this only adds fn to the ProjectState class
          // fn runs only have project changes
          // refers to the ProjectState class for more
          projectState.addListener((projects:Project[])=>{
              const relevantProjects = projects.filter((project)=>{
                  if(this.type === "active"){
                      return project.status === ProjectStatus.Active
                  }else{
                    return project.status === ProjectStatus.Finished

                  }
                      
                  
              })
              this.assignedProjects = relevantProjects;
              this.renderProjects();

          })
          this.attach();
          // this will always runs
          this.renderContent();
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`) ! as HTMLUListElement;
        // clean previous list and re-render each time
        listEl.innerHTML= ''
        for (const item of this.assignedProjects){
            const listItem = document.createElement('li');
            listItem.textContent = item.title
            listEl.appendChild(listItem)
        }

    }

    private renderContent(){
        const listID = `${this.type}-projects-list`;
        this.elem.querySelector('ul')!.id = listID;
        this.elem.querySelector('h2')!.textContent = this.type.toUpperCase() + 'PROJECTS'

    }
    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.elem);
      }

}

const projectInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished')