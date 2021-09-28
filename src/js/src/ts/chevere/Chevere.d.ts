import { Dispatch } from "@interfaces";
export declare abstract class Chevere {
    id: string;
    element: HTMLElement;
    constructor(element: HTMLElement);
    setId(): string;
    $emit(data: Dispatch): void;
}
