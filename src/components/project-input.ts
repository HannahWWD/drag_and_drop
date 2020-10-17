import {Component} from './base-component.js';
import {AutoBind} from '../decorators/autobind.js';
import {validate,ValidateObj} from '../utility/validation.js';
import {projectState} from '../state/project-state.js'

// ProjectInput class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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