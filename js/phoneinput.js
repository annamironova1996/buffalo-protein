document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('input[data-tel-input]');

    inputs.forEach((input) => {
        let lastNumbers = '';

        input.addEventListener('input', function (e) {
            let numbers = this.value.replace(/\D/g, '');

            if (numbers.length === 0) {
                this.value = '';
                lastNumbers = '';
                return;
            }

            if (numbers.length === 1 && numbers[0] === '8') {
                numbers = '7';
            }

            if (numbers === lastNumbers) return;
            lastNumbers = numbers;

            try {
                const phoneNumber = libphonenumber.parsePhoneNumber('+' + numbers);

                if (phoneNumber) {
                    this.value = phoneNumber.formatInternational();
                }
            } catch (error) {
                this.value = '+' + numbers;
            }
        });

        // Обработка вставки
        input.addEventListener('paste', function (e) {
            e.preventDefault();

            const pasted = e.clipboardData.getData('text');
            let numbers = pasted.replace(/\D/g, '');

            if (numbers.length > 0) {
                try {
                    const phoneNumber = libphonenumber.parsePhoneNumber('+' + numbers);
                    this.value = phoneNumber.formatInternational();
                } catch (error) {
                    this.value = '+' + numbers;
                }
            }
        });
    });
});
