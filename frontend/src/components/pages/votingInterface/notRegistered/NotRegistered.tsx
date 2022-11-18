const NotRegistered = () => {
    return (
        <div className="page-not-registered-error">
            <div className="row">
                <div className="col-12">
                    <div className="page-content">
                        <div className="row">
                            <div className="col-12">
                                <p style={{color: "#ff0000"}}>
                                    You cannot use this application because you are not a registered voter.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotRegistered;
