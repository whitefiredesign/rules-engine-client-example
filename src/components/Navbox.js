import React, { Component } from 'react';

const apiUrl =
    "https://f6gwvurnnb.execute-api.eu-west-2.amazonaws.com/dev/rules/";

class Navbox extends Component {
    state = {
        title : "",
        thumbnail: "",
        body: "",
        titleCheck:false,
        thumbnailCheck:false,
        bodyCheck:false
    };

    setImagePreview = async (file) => {
        let reader = new FileReader();
        reader.onload = e => {
            document.getElementById("thumbnail-preview").src
                = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    handleUpdate = (e) => {
        if(e.target.id==='thumbnail') {
            this.setImagePreview(e.target.files[0]);
        }

        this.setState({
            [e.target.id]: e.target.value
        })
    };

    getData = async () => {
        const { title, body } = this.state;
        let fields = {
            title: {},
            thumbnail: {},
            body: {}
        };
        let output = [];

        // Title
        fields['title']['charcount'] = title.length;

        // Thumbnail
        let t = new Image();
        t.onload = () => {
            fields['thumbnail']['width'] = t.width;
            fields['thumbnail']['height'] = t.height;
        };
        t.src =
            document.getElementById("thumbnail-preview").src;

        // Body
        fields['body']['charcount'] = body.length;

        for(const [field, value] of Object.entries(fields)) {

            let response =
                await fetch(
                apiUrl + 'navbox/' + field,
                {
                    method: 'post',
                    body: JSON.stringify(value),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            output.push(await response.json());
        }

        return output;
    };

    processAudit = async () => {

        const message = (field, loading, pass, message) => {
            return <div>
                {(loading ? <div className="loader" /> : '')}
                Checking {field}...
                {(!loading ? (pass
                    ? <span className="pass">&#10003;</span>
                    : <span className="fail">&#10005;</span>
                ) : '')}
                <div className="message">{message}</div>
            </div>
        };

        this.setState({
            titleCheck:message('title', true),
            thumbnailCheck:message('thumbnail', true),
            bodyCheck:message('body', true)
        });

        /**
         * TODO: This could be cleaner
         */
        const data = await this.getData();
        for(let i=0; i<data.length; i++) {
            if(data[i].pass) {
                if(data[i].payload.field==='title') {
                    this.setState({
                        titleCheck:message('title', false, true)
                    })
                }
                if(data[i].payload.field==='thumbnail') {
                    this.setState({
                        thumbnailCheck:message('thumbnail', false, true)
                    })
                }
                if(data[i].payload.field==='body') {
                    this.setState({
                        bodyCheck:message('body', false, true)
                    })
                }
            } else {
                if(data[i].payload.field==='title') {
                    this.setState({
                        titleCheck:message(
                            'title',
                            false,
                            false,
                            data[i].message
                        )
                    })
                }
                if(data[i].payload.field==='thumbnail') {
                    this.setState({
                        thumbnailCheck:message(
                            'thumbnail',
                            false,
                            false,
                            data[i].message
                        )
                    })
                }
                if(data[i].payload.field==='body') {
                    this.setState({
                        bodyCheck:message(
                            'body',
                            false,
                            false,
                            data[i].message
                        )
                    })
                }
            }
        }
    };

    render() {
        const {
            title,
            thumbnail,
            body,
            titleCheck,
            thumbnailCheck,
            bodyCheck
        } = this.state;

        return(
            <>
                <h3>Rules engine client demo</h3>
                <hr />
                <p>Fill in the form to add content to the Navbox then click 'Audit' to check whether it's valid.</p>
                <div className="form">
                    <label htmlFor="title">Title</label>
                    <input id="title" type="text"
                           onChange={(e) => this.handleUpdate(e)}
                           value={title}
                    />
                    <label htmlFor="thumbnail">Thumbnail</label>
                    <input id="thumbnail" type="file"
                           onChange={(e) => this.handleUpdate(e)}
                           value={thumbnail}
                    />
                    <label htmlFor="body">Body</label>
                    <textarea id="body"
                              rows="10"
                              onChange={(e) => this.handleUpdate(e)}
                              value={body} />

                    <button onClick={this.processAudit}>Process audit</button>
                    <hr />
                    <div className="audit">
                        <h3>Audit results will appear below.</h3>
                        {titleCheck}
                        {thumbnailCheck}
                        {bodyCheck}
                    </div>
                </div>
                <div className="preview">
                    <div className="navbox">
                        <div className="navbox-title">
                            {title}
                            <div className="field-helper">Title</div>
                        </div>
                        <div className="navbox-thumbnail">
                            <img id="thumbnail-preview" src="//placehold.it/300/200" alt="" />
                            <div className="field-helper">Thumbnail</div>
                        </div>
                        <div className="navbox-body">
                            {body}
                            <div className="field-helper">Body</div>
                        </div>
                        <div className="navbox-actions">
                            <button>CLICK OR TAP HERE <br /><small>(just for show)</small></button>
                        </div>
                    </div>
                    <div>
                        <h3>Policy</h3>
                        <ul>
                            <li><b>Title</b> character count must be greater than 3 and less than 20</li>
                            <li><b>Thumbnail</b> must be exactly 300x300px</li>
                            <li><b>Body</b> character count must be greater than 300 and less than 400</li>
                        </ul>
                    </div>
                </div>
            </>
        );
    }
}

export default Navbox;