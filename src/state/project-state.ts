import {Project, ProjectStatus} from '../modules/project-class.js';


type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// project state management

export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance();