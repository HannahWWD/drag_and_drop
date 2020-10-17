
// component base class

export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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