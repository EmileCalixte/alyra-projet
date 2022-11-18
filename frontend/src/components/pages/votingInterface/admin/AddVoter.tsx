import React, {useCallback, useContext, useEffect, useState} from "react";
import {appContext} from "../../../App";
import {ethers} from "ethers";

const AddVoter: React.FunctionComponent<{
    alreadyRegisteredVoters: string[],
    afterSubmit: (address: string) => any
}> = ({alreadyRegisteredVoters, afterSubmit}) => {
    const {voting} = useContext(appContext);

    const [inputValue, setInputValue] = useState("");
    const [inputError, setInputError] = useState<string|null>(null);

    const onSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!voting) {
            return;
        }

        try {
            const address = ethers.utils.getAddress(inputValue);

            setInputError(null);

            try {
                console.log(await voting.addVoter(address));
            } catch (error) {
                console.error(error);
                return;
            }

            setInputValue("");

            afterSubmit(address);
        } catch (error) {
            setInputError("Invalid address or bad checksum");
        }
    }, [inputValue, voting, afterSubmit]);

    useEffect(() => {
        if (alreadyRegisteredVoters.includes(inputValue)) {
            setInputError("This address is already a voter");
            return;
        }

        setInputError(null);
    }, [inputValue, alreadyRegisteredVoters]);

    return (
        <section className="admin-add-voter-section">
            <div className="row">
                <div className="col-xl-6 col-lg-8 col-md-10 col-12">
                    <h3>Add voter</h3>

                    <form onSubmit={onSubmit} className="one-input-form">
                        {inputError &&
                        <div className="input-error">
                            {inputError}
                        </div>
                        }
                        <div className="one-input-form-input-group">
                            <input type="text"
                                   className={`input ${inputError ? "error" : ''}`}
                                   placeholder="0x…"
                                   maxLength={42}
                                   value={inputValue}
                                   onChange={e => setInputValue(e.target.value)}
                            />
                            <button type="submit" className="button" disabled={inputError !== null}>Add voter</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default AddVoter;
