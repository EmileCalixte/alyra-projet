import React from "react";

const ProposalsList: React.FunctionComponent<{proposals: string[]}> = ({proposals}) => {
    return (
        <section className="proposals-proposals-list-section">
            <div className="row">
                <div className="col-12">
                    <h3>Submitted proposals</h3>

                    {proposals.length === 0 &&
                    <p><i>No proposals have been submitted yet</i></p>
                    }

                    {proposals.length > 0 &&
                    <ul>
                        {proposals.map((proposal, index) => {
                            return (
                                <li key={index}>{proposal}</li>
                            )
                        })}
                    </ul>
                    }
                </div>
            </div>
        </section>
    );
}

export default ProposalsList;
