(function (w, d) {
    const regex = {
        any: /fname|firstname|lname|lastname|name|full|fullname|mobile|phone|^number$|tel|email|street|address|city|zip/,
        firstName: /(fname|firstname)/,
        lastName: /(lname|lastname)/,
        fullName: /^(name|full|fullname)$/,
        phoneNumber: /(mobile|phone|^number$|tel)/,
        email: /(email)/,
        streetAddress: /(street|address)/,
        city: /(city)/,
        zip: /(zip)/,
    };

    const dm = w["dm"];
    const apiKey = dm.q;

    if (!apiKey) return;

    fetch(`${process.env.BASE_URL}${apiKey}`)
        .then((r) => r.json())
        .then((tracker) => {
            addFormSubmitListener(tracker)
        })
        .catch(() => {
            // addFormSubmitListener({formIndex: 0});
            // avoid potential security risk
        });

    function getFormInput(field, value, payload) {
        field = field.replaceAll(/_|\*/g, "").toLowerCase();
        value.trim();
        if (!regex.any.test(field)) return;
        if (regex.firstName.test(field)) {
            payload.firstName = value;
        } else if (regex.lastName.test(field)) {
            payload.lastName = value;
        } else if (regex.fullName.test(field)) {
            const [firstName, lastName] = value.split(/\s\+/);
            payload.firstName = firstName;
            payload.lastName = lastName;
        } else if (regex.phoneNumber.test(field)) {
            payload.phoneNumber = value;
        } else if (regex.email.test(field)) {
            payload.email = value;
        } else if (regex.streetAddress.test(field)) {
            payload.streetAddress = value;
        } else if (regex.city.test(field)) {
            payload.city = value;
        } else if (regex.zip.test(field)) {
            payload.zip = value;
        }
    }
    function appendFormDataToPayload(formData) {
        const properties = {};
        for (let [field, value] of formData) {
            getFormInput(field, value, properties);
        }
        return properties;
    }

    function addFormSubmitListener(tracker) {
        const [trackerKey, trackerId] = getTrackerQueryParam();
        if (trackerKey && trackerId) {
            const form = tracker.formId
                ? d.getElementById(formId)
                : d.getElementsByTagName("form").item(tracker.formIndex || 0);

            form.addEventListener(
                "submit",
                () => {
                    const formData = new FormData(form);
                    handleFormSubmit(trackerKey, trackerId, formData);
                    return true;
                },
                {capture: true}
            );
        }
    }

    function handleFormSubmit(trackerKey, trackerId, formData) {
        const payload = {[trackerKey]: trackerId};
        payload.properties = appendFormDataToPayload(formData);
        if (Object.keys(payload.properties).length) {
            fetch(`${process.env.BASE_URL}${apiKey}/contact`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify(payload),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                })
                .catch((err) => {
                    console.error("Error creating Hubspot contact", err);
                });
        }
    }

    function getTrackerQueryParam() {
        const query = w.location.search.substring(1);
        const params = query.split("&");
        const trackerParams = params.find((param) => /^(gclid|fbclid)=.*/.test(param));
        if (trackerParams) {
            return trackerParams.split("=");
        }
        return [null, null];
    }
})(window, document);
