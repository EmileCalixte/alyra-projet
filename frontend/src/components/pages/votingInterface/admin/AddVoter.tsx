import React, {useCallback, useState} from "react";

const AddVoter = () => {
    const [inputValue, setInputValue] = useState("");

    const onSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        console.log(inputValue);
        // TODO send transaction
        setInputValue("");
    }, [inputValue]);

    return (
        <section className="admin-add-voter-section">
            <div className="row">
                <div className="col-xl-6 col-lg-8 col-md-10 col-12">
                    <h3>Add voter</h3>

                    <form onSubmit={onSubmit} className="one-input-form">
                        <input type="text"
                               className="input"
                               placeholder="0x…"
                               maxLength={42}
                               value={inputValue}
                               onChange={e => setInputValue(e.target.value)}
                        />
                        <button type="submit" className="button m">Add voter</button>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default AddVoter;
