export const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }
    return age;
};

export const checkEmpty = (data) => {
    let msg = '';
    let flag = false;

    for (let item of data) {
        if (item.value.toString().trim() === '') {
            flag = true;
            msg += `${item.key}, `;
        }
    }

    if (flag) {
        msg = msg.substring(0, msg.length - 2);
        msg += ' required to submit';
    }

    return msg;
};