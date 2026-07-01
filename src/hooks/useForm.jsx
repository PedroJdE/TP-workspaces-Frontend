import { useState } from "react"

function useForm(initial_form_state, submitFn) {

    const [formState, setFormState] = useState(initial_form_state)
    function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormState((prevState) => ({
        ...prevState,
        [name]: type === "checkbox" ? checked : value,
    }));
}

    function handleSubmit (event){
        event.preventDefault()
        submitFn(formState)
    }

    return {
        formState,
        handleChange,
        handleSubmit
    }
}

export default useForm