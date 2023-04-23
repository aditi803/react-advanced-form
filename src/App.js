import { useState } from 'react';
import { BsTrash, BsUpload } from "react-icons/bs";
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Api } from "./ApiClient";
import { Endpoints } from "./Endpoints";
import { calculateAge, checkEmpty } from './Utils';
import Loader from './Loader';
import ReactDOM from 'react-dom';

const App = () => {
  const [loading, setLoading] = useState(false);
    const [checkbox, setCheckbox] = useState(false);
    const [inputs, setInputs] = useState([{
        fileName: '',
        type: 'pdf',
        fileLocation: ''
    }]);
    const [data, setData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dob: '',
        resStreet1: '',
        resStreet2: '',
        perStreet1: '',
        perStreet2: '',
    });


    const checkBoxhandler = () => {
        if (checkbox === false) {
            setData((oldState) => ({
                ...oldState,
                perStreet1: oldState.resStreet1,
                perStreet2: oldState.resStreet2,
            }));
            setCheckbox(true);
            return;
        }
        setCheckbox(false);
    };

    const changeHandler = (uid, e) => {
        setData((oldState) => ({
            ...oldState,
            [uid]: e.target.value,
        }));
    };

    const handleInputChange = (uid, index, event) => {
        const newInputs = [...inputs];
        newInputs[index] = {
            ...newInputs[index],
            [uid]: uid === "fileLocation" ? event.target.files?.[0] : event.target.value
        };
        setInputs(newInputs);
    };

    const handleAddInput = () => {
        if (inputs?.length === 4) {
            toast("Maximum 4 fields can be added");
            return;
        }
        setInputs([...inputs, {
            fileName: '',
            type: 'pdf',
            fileLocation: ''
        }]);
    };

    const handleRemoveInput = (index) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
    };

    const submitHandler = () => {
        const msg = checkEmpty([
            {
                key: 'First Name',
                value: data.firstName,
            },
            {
                key: 'Last Name',
                value: data.lastName,
            },
            {
                key: 'Email',
                value: data.email,
            },
            {
                key: 'Date of Birth',
                value: data.dob,
            },
            {
                key: 'Resedential Address Street 1',
                value: data.resStreet1,
            },
            {
                key: 'Resedential Address Street 1',
                value: data.resStreet2,
            },
        ]);

        if (!!msg) {
            toast(msg);
            return;
        }

        const age = calculateAge(data.dob);

        if (age < 18) {
            toast('Age must be atleast 18 years');
            return;
        }

        if (inputs?.length < 2) {
            toast("Minimum 2 documents are required to proceed");
            return;
        }

        for (let item of inputs) {
            if (item.fileName === "" || item.fileLocation === "") {
                toast("Please choose all files");
                return;
            }

            const extension = item.fileLocation?.type?.split("/")?.at(-1);

            if (extension !== item.type) {
                toast("Make sure File extension and Type of File are same");
                return;
            }
        }

        const formData = new FormData();
        formData.append("first_name", data.firstName);
        formData.append("last_name", data.lastName);
        formData.append("email", data.email);
        formData.append("dob", data.dob);
        formData.append("c_address_s1", data.resStreet1);
        formData.append("c_address_s2", data.resStreet2);
        formData.append("is_permanent_current_add", !!checkbox ? 1 : 0);
        formData.append("p_address_s1", data.perStreet1);
        formData.append("p_address_s2", data.perStreet2);

        for (let i = 0; i < inputs.length; i++) {
            formData.append(`documents[${i}][document_name]`, inputs[i].fileName);
            formData.append(`documents[${i}][document_type]`, inputs[i].type);
            formData.append(`documents[${i}][document_file]`, inputs[i].fileLocation);
        }

        setLoading(true);
        Api.post(Endpoints.DOCUMENT_SUBMIT, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                "Accept": 'application/json'
            }
        }).then(res => {
            if (res.data?.status_code === 201) {
                toast("Successfully Submitted");
                setData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    dob: '',
                    resStreet1: '',
                    resStreet2: '',
                    perStreet1: '',
                    perStreet2: '',
                });
                setInputs([{
                    fileName: '',
                    type: 'pdf',
                    fileLocation: ''
                }]);
                setCheckbox(false);
            }
        })
            .catch(err => toast(err?.response?.data?.message + " Unable to store this data"))
            .finally(() => setLoading(false));
    };

    return (
      <>
      {loading && ReactDOM.createPortal(<Loader />, document.getElementById("loader"))}
        <div className='body'>
            <div className='row nomargin'>
                <div className='col'>
                    <p>
                        First Name <span className='required'>*</span>
                    </p>
                </div>
                <div className='col'>
                    <p>
                        Last Name <span className='required'>*</span>
                    </p>
                </div>
            </div>

            <div className='row'>
                <input
                    className='col'
                    type='text'
                    placeholder='Enter your first name here..'
                    value={data.firstName}
                    onChange={changeHandler.bind(this, 'firstName')}
                />
                <input
                    className='col'
                    type='text'
                    placeholder='Enter your last name here..'
                    value={data.lastName}
                    onChange={changeHandler.bind(this, 'lastName')}
                />
            </div>

            <div className='row nomargin'>
                <div className='col'>
                    <p>
                        E-mail <span className='required'>*</span>
                    </p>
                </div>
                <div className='col'>
                    <p>
                        Date of Birth <span className='required'>*</span>
                    </p>
                </div>
            </div>

            <div className='row nomargin'>
                <input
                    className='col'
                    type='text'
                    placeholder='ex: myname@example.com'
                    value={data.email}
                    onChange={changeHandler.bind(this, 'email')}
                />
                <input
                    className='col'
                    type='date'
                    placeholder='Date of Birth'
                    value={data.dob}
                    onChange={changeHandler.bind(this, 'dob')}
                />
            </div>

            <div className='row'>
                <div className='col'></div>
                <div className='col'>
                    <p className='small'>(Min. age should be 18 Years) </p>
                </div>
            </div>

            <h2>Residential Address</h2>
            <div className='row nomargin'>
                <div className='col'>
                    <p>
                        Street 1 <span className='required'>*</span>
                    </p>
                </div>
                <div className='col'>
                    <p>
                        Street 2 <span className='required'>*</span>
                    </p>
                </div>
            </div>

            <div className='row'>
                <input
                    className='col'
                    type='text'
                    value={data.resStreet1}
                    onChange={changeHandler.bind(this, 'resStreet1')}
                />
                <input
                    className='col'
                    type='text'
                    value={data.resStreet2}
                    onChange={changeHandler.bind(this, 'resStreet2')}
                />
            </div>

            <div className='checkbox'>
                <input
                    type='checkbox'
                    checked={checkbox}
                    onChange={checkBoxhandler}
                    id='cbox'
                />
                <label htmlFor='cbox'>Same As Residential Address</label>
            </div>

            <h2>Permanent Address</h2>
            <div className='row nomargin'>
                <div className='col'>
                    <p>Street 1</p>
                </div>
                <div className='col'>
                    <p>Street 2</p>
                </div>
            </div>

            <div className='row'>
                <input
                    className='col'
                    type='text'
                    value={data.perStreet1}
                    onChange={
                        checkbox
                            ? undefined
                            : changeHandler.bind(this, 'perStreet1')
                    }
                    disabled={checkbox}
                />
                <input
                    className='col'
                    type='text'
                    value={data.perStreet2}
                    onChange={
                        checkbox
                            ? undefined
                            : changeHandler.bind(this, 'perStreet2')
                    }
                    disabled={checkbox}
                />
            </div>

            <div>
                <h2>Upload Documents</h2>
                {inputs.map((input, index) => (
                    <div className='docContainer' key={index.toString()}>
                        <div className='row nomargin'>
                            <div className='col'>
                                <p>File Name <span className='required'>*</span></p>
                            </div>
                            <div className='col'>
                                <p>Type of File <span className='required'>*</span></p>
                            </div>
                            <div className='col'>
                                <p>Upload Document <span className='required'>*</span></p>
                            </div>
                        </div>

                        <div className='row'>
                            <input className='col' value={input.fileName} onChange={handleInputChange.bind(this, "fileName", index)} />
                            <select className='col' value={input.type} onChange={handleInputChange.bind(this, "type", index)}>
                                <option value="pdf">PDF</option>
                                <option value="image">Image</option>
                            </select>
                            <label htmlFor={`file-upload${index}`} className='col upload'>
                                <span className='fileName'>{input?.fileLocation?.name}</span>
                                <BsUpload />
                            </label>
                            <input className='file-upload' id={`file-upload${index}`} type='file' onChange={handleInputChange.bind(this, "fileLocation", index)} accept={input.type === "image" ? "image/*" : ".pdf"} />
                            {index === 0 && (
                                <button onClick={handleAddInput} className='customBtn primaryBtn'>
                                    <FaPlus />
                                </button>
                            )}
                            {index > 0 && (
                                <button onClick={() => handleRemoveInput(index)} className='customBtn secondaryBtn'>
                                    <BsTrash />
                                </button>
                            )}
                        </div>
                    </div>

                ))}
            </div>

            <div className='btnRow'>
                <button className='customBtn primaryBtn' onClick={submitHandler} disabled={loading}>
                    Submit
                </button>
            </div>
        </div>
      </>
    );
};

export default App;
