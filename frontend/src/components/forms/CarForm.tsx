interface CarFormProps {
    isAdmin?: boolean;
    onSubmit: (data: FormData) => Promise<void>;
    defaultValues?: Partial<any>;
}