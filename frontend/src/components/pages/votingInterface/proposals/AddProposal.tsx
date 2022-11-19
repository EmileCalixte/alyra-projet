import React, {useCallback, useContext, useState} from "react";
import {appContext} from "../../../App";

const AddProposal: React.FunctionComponent<{
    afterSubmit: (proposal: string) => any,
}> = ({afterSubmit}) => {
    const {voting} = useContext(appContext);

    const [inputValue, setInputValue] = useState("");

    const onSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!voting) {
            return;
        }

        await voting.addProposal(inputValue);

        afterSubmit(inputValue);

        setInputValue("");
    }, [inputValue, voting, afterSubmit]);

    return (
        <section className="proposals-add-proposal-section">
            <div className="row">
                <div className="col-12">
                    <h3>Submit a proposal</h3>

                    <form onSubmit={onSubmit} className="one-input-form">
                        <div className="one-input-form-input-group">
                            <input type="text"
                                   className="input"
                                   placeholder="Proposal description"
                                   maxLength={200}
                                   value={inputValue}
                                   onChange={e => setInputValue(e.target.value)}
                            />
                            <button type="submit" className="button" disabled={inputValue === ""}>Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default AddProposal;
