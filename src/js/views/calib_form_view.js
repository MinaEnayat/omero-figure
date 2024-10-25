import Backbone from "backbone";
import _ from "underscore";
import $ from "jquery";

import FigureLutPicker from "../views/lutpicker";
import FigureColorPicker from "../views/colorpicker";

import calib_form_template from '../../templates/calib_form.template.html?raw';

// Created new for each selection change
var CalibFormView = Backbone.View.extend({

    template: _.template(calib_form_template),

    initialize: function(opts) {

        // prevent rapid repetitive rendering, when listening to multiple panels
        this.render = _.debounce(this.render);

        this.models = opts.models;
        var self = this;

        this.models.forEach(function(m){
            self.listenTo(m, 'change:calib change:lutBgPos change:lutIndex change:lutName', self.render);
        });
    },

    events: {
        "submit .calib_form": "update_calib",
        "click .calib_label": "update_calib",
        "change .btn": "dropdown_btn_changed",
        "click .hide_calib": "hide_calib",
        "click .lutpicker-btn": "pick_lut",  // Event to open the LUT picker
     },

    // Automatically submit the form when a dropdown is changed
    dropdown_btn_changed: function(event) {
        $(event.target).closest('form').submit();
    },

    hide_calib: function() {
        this.models.forEach(function(m){
            m.hide_calib();
        });
    },

    // called when form changes
    update_calib: function(event) {
        var $form = $('.calib_form');
        var position = $('.label-position i:first', $form).attr('data-position');
        var lutBgPos = $('.lut-pos', $form).val();  // Getting LUT position input
        var lutIndex = $('.lut-index', $form).val();  // Getting LUT index input
        var lutName = $('.lut-name', $form).val();  // Getting LUT name input

        this.models.forEach(function(m){
            var old_cb = m.get('calib');
            var cb = { show: true };

            if (position != '-') cb.position = position;
            if (lutBgPos != '-') cb.lutBgPos = lutBgPos;  // Update lutBgPos in the model
            if (lutIndex != '-') cb.lutIndex = lutIndex;  // Update lutIndex in the model
            if (lutName != '-') cb.lutName = lutName;  // Update lutName in the model

            m.save_calib(cb);
        });
        return false;
    },

    pick_lut: function(e) {
        var self = this;
        FigureLutPicker.show({
            success: function(lutName) {
                self.models.forEach(function(m){
                    m.save_calib({ lutName: lutName });
                });
            }
        });
    },

    render: function() {
        var json = {show: false},
            hidden = false,
            cb;

        this.models.forEach(function(m){
            cb = m.get('calib');
            var lutBgPos = m.get('lutBgPos');  // Fetch lutBgPos from the model
            var lutIndex = m.get('lutIndex');  // Fetch lutIndex from the model
            var lutName = m.get('lutName');  // Fetch lutName from the model

            // if panel has calib, combine into json
            if (cb) {
                if (!json.length) {
                    json.position = cb.position;
                    json.lutBgPos = lutBgPos;  // Add lutBgPos to the json
                    json.lutIndex = lutIndex;  // Add lutIndex to the json
                    json.lutName = lutName;  // Add lutName to the json
                } else {
                    if (json.position != cb.position) json.position = '-';
                    if (json.lutBgPos != lutBgPos) json.lutBgPos = '-';
                    if (json.lutIndex != lutIndex) json.lutIndex = '-';
                    if (json.lutName != lutName) json.lutName = '-';
                }
            }
            // if any panels don't have calib - we allow to add
            if(!cb || !cb.show) hidden = true;
        });

        if (this.models.length === 0 || hidden) {
            json.show = true;
        }

        json.position = json.position || 'right';

        var html = this.template(json);
        this.$el.html(html);

        return this;
    }
});

export default CalibFormView;

// import Backbone from "backbone";
// import _ from "underscore";
// import $ from "jquery";

// import FigureLutPicker from "../views/lutpicker";
// import FigureColorPicker from "../views/colorpicker";

// import calib_form_template from '../../templates/calib_form.template.html?raw';


// // Created new for each selection change
// var CalibFormView = Backbone.View.extend({

//     template: _.template(calib_form_template),

//     initialize: function(opts) {

//         // prevent rapid repetative rendering, when listening to multiple panels
//         this.render = _.debounce(this.render);

//         this.models = opts.models;
//         var self = this;

//         this.models.forEach(function(m){
//             self.listenTo(m, 'change:calib', self.render);
//         });
//     },

//     events: {
//         "submit .calib_form": "update_calib",
//         "click .calib_label": "update_calib",
//         "change .btn": "dropdown_btn_changed",
//         "click .hide_calib": "hide_calib",
//      },

//     // Automatically submit the form when a dropdown is changed
//     dropdown_btn_changed: function(event) {
//         $(event.target).closest('form').submit();
//     },

//     hide_calib: function() {
//         this.models.forEach(function(m){
//             m.hide_calib();
//         });
//     },

//     // called when form changes
//     update_calib: function(event) {

//         var $form = $('.calib_form');
//         var position = $('.label-position i:first', $form).attr('data-position');

//         this.models.forEach(function(m){
//             var old_cb = m.get('calib');
//             var cb = {show: true};

//             if (position != '-') cb.position = position;
//             m.save_calib(cb);
//         });
//         return false;
//     },

//     render: function() {
//         var json = {show: false},
//             hidden = false,
//             cb;

        
//         this.models.forEach(function(m){
            
//             cb = m.get('calib');
//             // if panel has calib, combine into json
//             if (cb) {
//                 // for first panel, json = cb
//                 if (!json.length) {
//                     json.position = cb.position;
//                 }
//                 else {
//                     if (json.position != cb.position) json.position = '-';
//                 }
//             }
//             // if any panels don't have calib - we allow to add
//             if(!cb || !cb.show) hidden = true;
//         });

//         if (this.models.length === 0 || hidden) {
//             json.show = true;
//         }
        
//         json.position = json.position || 'right';

//         var html = this.template(json);
//         this.$el.html(html);
//         // this.$el.find("[title]").tooltip();

//         return this;
//     }
// });

// export default CalibFormView

