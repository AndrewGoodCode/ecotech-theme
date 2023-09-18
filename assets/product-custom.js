
$(document).ready(function () {
    let p_time = localStorage.getItem('p_time');
    let t = Date.now();
    /* load saved project from local */
    let str = localStorage.getItem('my_projects');
    let my_projects = [];
    let customer_id = $('#customer-id').val();
    if (!customer_id && !!str) {
        my_projects = JSON.parse(str);
        console.log('my_projects', my_projects)
        my_projects.forEach(project => {
            let tr_num = $('#optionSelect1 table tr').length ? $('#optionSelect1 table tr').length : 1;
            let str = `<tr><td class=''>${tr_num}</td><td class='p-name'>${project.p_name}</td><td class='p-notes'>${project.p_notes}</td><td class='p-size'>${project.p_size}</td><td class='p-unit'>${project.p_unit}</td></tr>`
            $('#optionSelect1 table tbody').append(str);
        });
    }
    if (!p_time || t - p_time > 3600000) {
        localStorage.removeItem('p_name');
        localStorage.removeItem('p_notes');
        localStorage.removeItem('p_size');
        localStorage.removeItem('p_unit');
        localStorage.removeItem('p_time');
        $('#quantity-temp').val(1);
    } else {
        let p_name = localStorage.getItem('p_name');
        let p_notes = localStorage.getItem('p_notes');
        let p_size = localStorage.getItem('p_size');
        let p_unit = localStorage.getItem('p_unit');
        if (p_unit == 'sqm') {
            $('.sqf').removeClass('active');
            $('.sqm').addClass('active');
        }
        setTimeout(() => {
            if (!!$('#gallon-per-pkg').val() && !!$('#sqf-per-gallon').val()) {   
                if (!!p_name) {
                    $('#projectSelect option:first-child').text(p_name);
                    $('#projectSelect').val('select').trigger('change');
                }             

                $('#area-temp').val(p_size);
                $('#area-temp').trigger('change');
            }
        }, 1000);
    }
    if (!$('#gallon-per-pkg').val() || !$('#sqf-per-gallon').val()) {
        $('#quantity-temp').prop('disabled', false);
        $('#area-temp').prop('disabled', true);
        $('#isMeasurement').prop('disabled', true);
    }
    // set the unit as sqf or sqm
    $('.unit-type li').on('click', function () {
        if ($('.sqf').hasClass('active')) {
            $('.sqf').removeClass('active');
            $('.sqm').addClass('active');
        } else {
            $('.sqm').removeClass('active');
            $('.sqf').addClass('active');
        }
        setTimeout(function () {
            $('#area-temp').trigger('change');
        }, 500)
    })
    $('#isMeasurement').on('click', function () {
        let isMeasurement = $('#isMeasurement').prop('checked');
        $('#quantity-temp').val('1');
        $('#Quantity').val('1');
        $('#area-temp').val('1');
        if (isMeasurement) {
            $('#quantity-temp').prop('disabled', true);
            $('#area-temp').prop('disabled', false);
        } else {
            $('#quantity-temp').prop('disabled', false);
            $('#area-temp').prop('disabled', true);
        }
    })
    // calculate the quantity
    $('#area-temp').on('change input', function () {
        if ($('#gallon-per-pkg').val()) {
            let gallon_per_pkg = $('#gallon-per-pkg').val();
            let sqf_per_gallon = $('#sqf-per-gallon').val();
            console.log("gallon_per_pkg : ", gallon_per_pkg, 'sqf_per_gallon : ', sqf_per_gallon)
            let area = $('#area-temp').val();
            let sqf_per_pkg = gallon_per_pkg * sqf_per_gallon;
            console.log("sqf_per_pkg : ", sqf_per_pkg)
            let unit_type = 'sqf';
            if ($('.sqm').hasClass('active')) unit_type = 'sqm';
            console.log('unit_type : ', unit_type);
            const sqfs_per_sqm = 10.7639;
            let quantity = 0;
            if (unit_type == 'sqf') {
                quantity = Math.ceil(area / sqf_per_pkg);
            } else {
                quantity = Math.ceil(sqfs_per_sqm * area / sqf_per_pkg);
            }
            if (quantity == 0) quantity = 1;
            $('#quantity-temp').val(quantity);
            $('#Quantity').val(quantity);
            $('#Quantity').trigger('input');
        }
    })
    $('#quantity-temp').on('change input', function () {
        let quantity = $('#quantity-temp').val();
        if (quantity > 0) {
            if ($('#gallon-per-pkg').val()) {
                let gallon_per_pkg = $('#gallon-per-pkg').val();
                let sqf_per_gallon = $('#sqf-per-gallon').val();
                let modify_percentage = $('#modify_percentage').val();
                console.log("gallon_per_pkg : ", gallon_per_pkg, sqf_per_gallon, modify_percentage)
                let quantity = $('#quantity-temp').val();
                let sqf_per_pkg = gallon_per_pkg * sqf_per_gallon;
                console.log("sqf_per_pkg : ", sqf_per_pkg)
                let unit_type = 'sqf';
                if ($('.sqm').hasClass('active')) unit_type = 'sqm';
                console.log('unit_type : ', unit_type);
                const sqfs_per_sqm = 10.7639;
                let area = 0;
                if (unit_type == 'sqf') {
                    area = Math.round(sqf_per_pkg * quantity);
                } else {
                    area = Math.round(sqf_per_pkg * quantity / sqfs_per_sqm);
                }
                $('#quantity-temp').val(quantity);
                $('#area-temp').val(area);
                $('#Quantity').val(quantity);
                $('#Quantity').trigger('input');
            } else {
                let quantity = $('#quantity-temp').val();
                $('#quantity-temp').val(quantity);
                $('#Quantity').val(quantity);
                $('#Quantity').trigger('input');
            }
        }
    })
    $('#Quantity').on('change input', function () { 
        //total sum
        let quantity = $('#quantity-temp').val(); 
        let price = $('#current_variant_price').val();
        console.log('price, quantity', price, quantity)
        if (!!price && price > 0 && quantity > 0) {
            let total = price * quantity * 1.00 /100.00;
            let str = '$' + total.toFixed(2);
            $('#product-total-price').text(str);
        }
    })
    /* for projects */
    $('#projectSelect').on('change', function () {
        $("[id^='optionSelect']").removeClass('show-content');
        var val = $(this).val();
        $("#optionSelect" + val).addClass('show-content');
    });
    /* action for selecting project */
    $('#optionSelect1 table tr').on('click', function () {
        let p_name = $(this).find('.p-name').text();
        let p_notes = $(this).find('.p-notes').text();
        let p_size = $(this).find('.p-size').text();
        // console.log(p_name, p_notes, p_size);
        if (!p_name || !p_size) return;
        let p_unit = $(this).find('.p-unit').text().toLowerCase();
        let p_time = Date.now();
        saveLocal(p_name, p_notes, p_size, p_unit, p_time);

        if (p_unit == 'sqf') {
            $('.sqm').removeClass('active');
            $('.sqf').addClass('active');
        } else {
            $('.sqf').removeClass('active');
            $('.sqm').addClass('active');
        }
        $('#area-temp').val(p_size);
        $('#area-temp').trigger('change');

        $('#projectSelect option:first-child').text(p_name);
        $('#projectSelect').val('select').trigger('change');
        // console.log('selected', $('#projectSelect').val())
        // $('.project-picker .close').trigger('click');
    })
    /* action for adding new project */
    $('#optionSelect0 button').on('click', function (e) {
        e.preventDefault();
    })
    $('#myModal .btn-success').on('click', async function (e) {
        let p_name = $('#formProjectName').val();
        let p_notes = $('#formProjectNote').val();
        let p_size = $('#formProjectArea').val();
        let p_unit = $('#optionSelect0 .unit-type .active').text().toLowerCase();
        let p_time = Date.now();
        let customer_id = $('#customer-id').val();
        // console.log('ajax', customer_id, p_name, p_notes, p_size, p_unit)
        if (!p_name || !p_size || !(p_unit.toLowerCase() == 'sqf' || p_unit.toLowerCase() == 'sqm')) {
            toastr.error("Please input all data correctly.");
            return;
        }
        $('#myModal').removeClass('show');
        if (!customer_id) {
            let str = localStorage.getItem('my_projects');
            let my_projects = [];
            if (!!str) {
                my_projects = JSON.parse(str);
            }
            let new_p = {
                p_name, p_notes, p_size, p_unit
            };
            my_projects.push(new_p);
            localStorage.setItem('my_projects', JSON.stringify(my_projects));

            handleAfterSaving(p_name, p_notes, p_size, p_unit, p_time);
        } else {
            $.ajax({
                url: 'https://gcs-function-node-kxewkssnda-ue.a.run.app/saveCustomerProject',
                type: 'POST',
                crossDomain: true,
                data: JSON.stringify({
                    customer_id,
                    project_name: p_name,
                    project_notes: p_notes,
                    size: p_size,
                    unit: p_unit
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                success: function (data) {
                    console.log("data", data);
                    if (data.data == 'error') toastr.error("Adding project failed.");
                    else if (!!data.data.metafield) {
                        handleAfterSaving(p_name, p_notes, p_size, p_unit, p_time);
                        // $('.project-picker .close').trigger('click');
                    }
                },
                error: function (err) {
                    console.log("error", err); toastr.error("Unknown error.")
                }
            })
        }
    });
    //getting metafields for variant
    $('.single-option-radio input').on('change', function() {
        setTimeout(function() {
            let query = window.location.search;
            const params = new URLSearchParams(query);
            const variantID = params.get('variant');
            let gallon_per_package = $(`.variant-${variantID} .gallon_per_package`).text();
            let sqf_per_gallon = $(`.variant-${variantID} .sqf_per_gallon`).text();
            let modify_percentage = $(`.variant-${variantID} .modify_percentage`).text();
            $('#gallon-per-pkg').val(gallon_per_package);
            $('#sqf-per-gallon').val(sqf_per_gallon);
            $('#modify-percentage').val(modify_percentage);
        }, 300);
    })
})

function handleAfterSaving(p_name, p_notes, p_size, p_unit, p_time) {
    saveLocal(p_name, p_notes, p_size, p_unit, p_time);
    if (p_unit == 'sqf') {
        $('.sqm').removeClass('active');
        $('.sqf').addClass('active');
    } else {
        $('.sqf').removeClass('active');
        $('.sqm').addClass('active');
    }
    $('#area-temp').val(p_size);
    $('#area-temp').trigger('change');

    let tr_num = $('#optionSelect1 table tr').length ? $('#optionSelect1 table tr').length : 1;
    let str = `<tr><td class=''>${tr_num}</td><td class='p-name'>${p_name}</td><td class='p-notes'>${p_notes}</td><td class='p-size'>${p_size}</td><td class='p-unit'>${p_unit}</td></tr>`
    $('#optionSelect1 table tbody').append(str);

    $('#formProjectName').val('');
    $('#formProjectNote').val('');
    $('#formProjectArea').val('');
    toastr.success("Project saved.")

    $('#projectSelect option:first-child').text(p_name);
    $('#projectSelect').val('select').trigger('change');
}

function saveLocal(p_name, p_notes, p_size, p_unit, p_time) {
    localStorage.setItem('p_name', p_name);
    localStorage.setItem('p_notes', p_notes);
    localStorage.setItem('p_size', p_size);
    localStorage.setItem('p_unit', p_unit);
    localStorage.setItem('p_time', p_time);
    // console.log(p_name, p_notes, p_size, p_unit, p_time)
}