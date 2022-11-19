import React from "react";

const VotersList: React.FunctionComponent<{voters: string[]}> = ({voters}) => {
    return (
        <section className="admin-registered-voters-section">
            <div className="row">
                <div className="col-12">
                    <h3>Registered voters</h3>

                    {voters.length === 0 &&
                    <p><i>No voters have been registered yet</i></p>
                    }

                    {voters.length > 0 &&
                    <ul>
                        {voters.map((voter, index) => {
                            return (
                                <li key={index}>{voter}</li>
                            );
                        })}
                    </ul>
                    }
                </div>
            </div>
        </section>
    );
}

export default VotersList;
